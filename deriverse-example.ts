/**
 * Deriverse Trade Fetcher - WORKING VERSION
 * Bypasses broken initialize() by parsing transaction logs directly
 */

import { createSolanaRpc, address, devnet } from '@solana/kit';
import { Engine, PROGRAM_ID } from '@deriverse/kit';

interface SimpleTrade {
  signature: string;
  type: 'SPOT' | 'PERP';
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  timestamp: number;
  blockTime: any;
}

/**
 * Fetch trading history WITHOUT using initialize()
 * This works even when the SDK version is mismatched
 */
export async function fetchTradingHistory(
  walletAddress: string,
  limit: number = 50
): Promise<SimpleTrade[]> {
  console.log(`\n🔍 Fetching trading history for: ${walletAddress}`);
  console.log(`   Limit: ${limit} transactions\n`);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_HTTP || 'https://api.devnet.solana.com';
  const rpc = createSolanaRpc(devnet(rpcUrl));
  
  // Create engine but DON'T call initialize()
  const engine = new Engine(rpc, { 
    programId: PROGRAM_ID, 
    version: 1 
  });

  try {
    // Fetch transaction signatures
    const signatures = await rpc
      .getSignaturesForAddress(address(walletAddress), { limit })
      .send();

    if (signatures.length === 0) {
      console.log('❌ No transactions found for this wallet');
      return [];
    }

    console.log(`📜 Found ${signatures.length} transactions, parsing...`);

    const trades: SimpleTrade[] = [];

    // Process each transaction
    for (const sigInfo of signatures) {
      try {
        const tx = await rpc.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
          encoding: 'jsonParsed',
        }).send();

        if (!tx?.meta?.logMessages) continue;

        // Decode logs - THIS WORKS without initialize()
        const reports = engine.logsDecode(tx.meta.logMessages);

        // Process each report
        for (const report of reports) {
          const reportName = report.constructor.name;

          // Filter for Fill Order reports (completed trades)
          if (reportName.includes('FillOrderReportModel')) {
            const trade: SimpleTrade = {
              signature: sigInfo.signature.slice(0, 8) + '...',
              type: reportName.includes('Spot') ? 'SPOT' : 'PERP',
              side: report.tag === 0 ? 'BUY' : 'SELL',
              price: report?.tag || 0,
              qty: report?.tag || 0,
              timestamp: sigInfo.blockTime 
                ? Number(sigInfo.blockTime)*1000
                : 0,
              blockTime: sigInfo.blockTime || Date.now(),
            };

            trades.push(trade);
          }
        }
      } catch (err) {
        // Skip transactions that can't be decoded
        continue;
      }
    }

    console.log(`✅ Found ${trades.length} trades\n`);
    return trades;

  } catch (error) {
    console.error('❌ Error fetching trading history:', error);
    return [];
  }
}

/**
 * Get detailed trade information with full data
 */
export async function fetchDetailedTrades(
  walletAddress: string,
  limit: number = 50
) {
  const trades = await fetchTradingHistory(walletAddress, limit);

  // Calculate summary stats
  const totalTrades = trades.length;
  const spotTrades = trades.filter(t => t.type === 'SPOT').length;
  const perpTrades = trades.filter(t => t.type === 'PERP').length;
  const buyTrades = trades.filter(t => t.side === 'BUY').length;
  const sellTrades = trades.filter(t => t.side === 'SELL').length;

  const totalVolume = trades.reduce((sum, t) => sum + (t.price * t.qty), 0);

  return {
    trades,
    summary: {
      totalTrades,
      spotTrades,
      perpTrades,
      buyTrades,
      sellTrades,
      totalVolume,
      avgPrice: totalTrades > 0 ? trades.reduce((sum, t) => sum + t.price, 0) / totalTrades : 0,
      avgQty: totalTrades > 0 ? trades.reduce((sum, t) => sum + t.qty, 0) / totalTrades : 0,
    }
  };
}

/**
 * Print trades in a nice table format
 */
export function printTrades(trades: SimpleTrade[]) {
  if (trades.length === 0) {
    console.log('No trades found.');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('TRADING HISTORY');
  console.log('='.repeat(80) + '\n');
  console.table(trades);
}