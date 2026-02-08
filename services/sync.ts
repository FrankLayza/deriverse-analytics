/**
 * Trade Sync Service
 * Syncs Deriverse trades to Supabase database
 */

import { supabase, type TradeInsert } from '@/lib/supabase/client';
import { fetchDeriverseTrades, calculatePnL, type DecodedTrade } from '@/lib/deriverse/fetcher';

export interface SyncResult {
  success: boolean;
  newTrades: number;
  totalTrades: number;
  error?: string;
}

/**
 * Sync trades from Deriverse to Supabase
 */
export async function syncTradesToDatabase(
  userId: string,
  walletAddress: string,
  limit: number = 100
): Promise<SyncResult> {
  try {
    console.log(`[Sync] Starting sync for wallet: ${walletAddress}`);

    // Update sync status to SYNCING
    await supabase
      .from('sync_status')
      .upsert({
        user_id: userId,
        wallet_address: walletAddress,
        sync_status: 'SYNCING',
        updated_at: new Date().toISOString(),
      });

    // Fetch trades from Deriverse
    const deriverseTrades = await fetchDeriverseTrades(walletAddress, limit);
    
    if (deriverseTrades.length === 0) {
      await updateSyncStatus(userId, walletAddress, 'IDLE', 0);
      return {
        success: true,
        newTrades: 0,
        totalTrades: 0,
      };
    }

    // Calculate PnL
    const tradesWithPnL = calculatePnL(deriverseTrades);

    // Convert to database format
    const tradesToInsert: TradeInsert[] = tradesWithPnL.map(trade => ({
      user_id: userId,
      wallet_address: walletAddress,
      signature: trade.signature,
      trade_type: trade.type,
      side: trade.side,
      symbol: trade.symbol,
      price: trade.price.toString(),
      quantity: trade.quantity.toString(),
      fees: trade.fees.toString(),
      pnl: trade.pnl.toString(),
      order_type: trade.orderType,
      instrument_id: trade.instrumentId,
      client_id: trade.clientId,
      block_time: trade.blockTime,
      executed_at: trade.executedAt.toISOString(),
    }));

    // Insert trades (ignore duplicates)
    const { data, error } = await supabase
      .from('trades')
      .upsert(tradesToInsert, {
        onConflict: 'signature',
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error('[Sync] Error inserting trades:', error);
      await updateSyncStatus(userId, walletAddress, 'ERROR', 0, error.message);
      return {
        success: false,
        newTrades: 0,
        totalTrades: 0,
        error: error.message,
      };
    }

    const newTradesCount = data?.length || 0;

    // Get total trades count
    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Update sync status
    await updateSyncStatus(
      userId, 
      walletAddress, 
      'IDLE', 
      count || 0, 
      undefined, 
      tradesToInsert[0]?.signature
    );

    // Update trading sessions
    await updateTradingSessions(userId);

    console.log(`[Sync] Complete: ${newTradesCount} new trades, ${count} total`);

    return {
      success: true,
      newTrades: newTradesCount,
      totalTrades: count || 0,
    };

  } catch (error) {
    console.error('[Sync] Error:', error);
    await updateSyncStatus(userId, walletAddress, 'ERROR', 0, (error as Error).message);
    
    return {
      success: false,
      newTrades: 0,
      totalTrades: 0,
      error: (error as Error).message,
    };
  }
}

/**
 * Update sync status in database
 */
async function updateSyncStatus(
  userId: string,
  walletAddress: string,
  status: 'IDLE' | 'SYNCING' | 'ERROR',
  totalTrades: number,
  errorMessage?: string,
  lastSignature?: string
) {
  await supabase
    .from('sync_status')
    .upsert({
      user_id: userId,
      wallet_address: walletAddress,
      sync_status: status,
      total_trades_synced: totalTrades,
      last_synced_at: new Date().toISOString(),
      last_signature: lastSignature,
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    });
}

/**
 * Update trading sessions with aggregated data
 */
async function updateTradingSessions(userId: string) {
  // Get all trades
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId);

  if (!trades || trades.length === 0) return;

  // Group by date
  const sessionsByDate = new Map<string, any>();

  for (const trade of trades) {
    const date = new Date(trade.executed_at).toISOString().split('T')[0];
    
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, {
        total_trades: 0,
        total_pnl: 0,
        total_volume: 0,
        total_fees: 0,
        wins: 0,
      });
    }

    const session = sessionsByDate.get(date)!;
    session.total_trades++;
    session.total_pnl += parseFloat(trade.pnl || '0');
    session.total_volume += parseFloat(trade.price) * parseFloat(trade.quantity);
    session.total_fees += parseFloat(trade.fees || '0');
    if (parseFloat(trade.pnl || '0') > 0) session.wins++;
  }

  // Upsert sessions
  const sessions = Array.from(sessionsByDate.entries()).map(([date, data]) => ({
    user_id: userId,
    session_date: date,
    total_trades: data.total_trades,
    total_pnl: data.total_pnl.toString(),
    total_volume: data.total_volume.toString(),
    total_fees: data.total_fees.toString(),
    win_rate: data.total_trades > 0 ? (data.wins / data.total_trades * 100).toFixed(2) : '0',
  }));

  await supabase
    .from('trading_sessions')
    .upsert(sessions, {
      onConflict: 'user_id,session_date',
    });
}

/**
 * Get sync status for a wallet
 */
export async function getSyncStatus(userId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('sync_status')
    .select('*')
    .eq('user_id', userId)
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('[Sync] Error fetching status:', error);
    return null;
  }

  return data;
}
