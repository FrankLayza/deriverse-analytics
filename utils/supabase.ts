/**
 * Supabase Client Configuration - Updated for Modern Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Manual type definitions for our tables
// These match the schema.sql structure

export interface Profile {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  wallet_address: string;
  signature: string;
  market_type: 'SPOT' | 'PERP';
  side: 'buy' | 'sell';
  symbol: string;
  price: string;
  quantity: string;
  fees: string;
  realized_pnl: string | null;
  order_type: 'MARKET' | 'LIMIT' | null;
  instrument_id: number | null;
  client_id: number | null;
  block_time: number;
  executed_at: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface TradeInsert {
  user_id: string;
  wallet_address: string;
  signature: string;
  trade_type: 'SPOT' | 'PERP';
  side: 'BUY' | 'SELL';
  symbol: string;
  price: string;
  quantity: string;
  fees: string;
  pnl?: string | null;
  order_type?: 'MARKET' | 'LIMIT' | null;
  instrument_id?: number | null;
  client_id?: number | null;
  block_time: number;
  executed_at: string;
  notes?: string | null;
  tags?: string[] | null;
}

export interface TradingSession {
  id: string;
  user_id: string;
  session_date: string;
  total_trades: number;
  total_pnl: string;
  total_volume: string;
  total_fees: string;
  win_rate: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_value: string;
  total_pnl: string;
  total_trades: number;
  win_rate: string | null;
  created_at: string;
}

export interface SyncStatus {
  id: string;
  user_id: string;
  wallet_address: string;
  last_synced_at: string | null;
  last_signature: string | null;
  total_trades_synced: number;
  sync_status: 'IDLE' | 'SYNCING' | 'ERROR' | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}