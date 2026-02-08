/**
 * Test the working trade fetcher
 */

import { fetchDetailedTrades, printTrades } from './deriverse-example';

// Your wallet address
const WALLET = "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";

async function test() {
  console.log('Testing Deriverse Trade Fetcher');
  console.log('Wallet:', WALLET);

  const result = await fetchDetailedTrades(WALLET, 100);

  // Print summary
  console.log('\n📊 SUMMARY:');
  console.log('─'.repeat(40));
  console.log(`Total Trades: ${result.summary.totalTrades}`);
  console.log(`  ├─ Spot: ${result.summary.spotTrades}`);
  console.log(`  └─ Perp: ${result.summary.perpTrades}`);
  console.log(`Buy Trades: ${result.summary.buyTrades}`);
  console.log(`Sell Trades: ${result.summary.sellTrades}`);
  console.log(`Total Volume: $${result.summary.totalVolume.toFixed(2)}`);
  console.log(`Avg Price: $${result.summary.avgPrice.toFixed(2)}`);
  console.log(`Avg Quantity: ${result.summary.avgQty.toFixed(4)}`);

  // Print trades
  printTrades(result.trades);

  // Return data for dashboard use
  return result;
}

test().catch(console.error);