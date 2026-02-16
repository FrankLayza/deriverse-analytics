/**
 * Deriverse Trade Decoder - FINAL VERSION
 * Based on actual log structure analysis
 */

import { createSolanaRpc, address, devnet } from "@solana/kit";

const WALLET = "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";

interface DecodedTrade {
  signature: string;
  type: "SPOT" | "PERP";
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  timestamp: string;
  blockTime: number;
  orderId: number;
  clientId: number;
  instrumentId: number;
}

// Read functions for binary data
function readU8(buffer: Buffer, offset: number): number {
  return buffer.readUInt8(offset);
}

function readU32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function readU64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset);
}

function readI64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigInt64LE(offset);
}

/**
 * Decode SpotFillOrderReport or PerpFillOrderReport
 *
 * Based on hex analysis:
 * Offset 0: u8 - log type (18=Spot, 19=Perp)
 * Offset 1-4: u32 - flags/metadata
 * Offset 5-8: u32 - client ID
 * Offset 9-12: u32 - instrument ID
 * Offset 13-20: i64 - price (fixed point)
 * Offset 21-28: i64 - quantity (fixed point)
 * Offset 29-36: i64 - timestamp or order ID
 * Offset 37-44: i64 - additional data
 */
function decodeFillOrderReport(base64Data: string, logType: number): any {
  const buffer = Buffer.from(base64Data, "base64");

  try {
    // Read all fields as raw values first
    const flags = readU32LE(buffer, 1);
    const clientId = readU32LE(buffer, 5);
    const instrumentId = readU32LE(buffer, 9);

    // Price and qty are likely i64 fixed-point numbers
    // Deriverse uses different decimals, we'll need to discover the conversion
    const priceRaw = readI64LE(buffer, 13);
    const qtyRaw = readI64LE(buffer, 21);
    const field6 = readI64LE(buffer, 29);
    const field7 = readI64LE(buffer, 37);

    // Side is likely in the flags (bit 0: 0=buy, 1=sell)
    const side = (flags & 1) === 0 ? "BUY" : "SELL";

    // Convert fixed-point to decimal
    // Deriverse typically uses 9 decimals (like SOL)
    const PRICE_DECIMALS = 1_000_000; // 10^6 for price
    const QTY_DECIMALS = 1_000_000_000; // 10^9 for quantity
    const price = Math.abs(Number(priceRaw)) / PRICE_DECIMALS;
    const quantity = Math.abs(Number(qtyRaw)) / QTY_DECIMALS;
    // console.log(priceRaw);
    return {
      logType,
      flags,
      clientId,
      instrumentId,
      side,
      price,
      quantity,
      priceRaw: priceRaw.toString(),
      qtyRaw: qtyRaw.toString(),
      field6: field6.toString(),
      field7: field7.toString(),
    };
  } catch (error) {
    console.error("Decode error:", error);
    return null;
  }
}

/**
 * Fetch and decode all trades
 */
export async function fetchAllTrades(
  walletAddress: string,
  limit: number = 50,
): Promise<DecodedTrade[]> {
  console.log(`\n🔍 Fetching trades for: ${walletAddress}\n`);

  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_HTTP || "https://api.devnet.solana.com";
  const rpc = createSolanaRpc(devnet(rpcUrl));

  const signatures = await rpc
    .getSignaturesForAddress(address(walletAddress), { limit })
    .send();

  console.log(`📜 Found ${signatures.length} transactions\n`);

  const trades: DecodedTrade[] = [];

  for (const sigInfo of signatures) {
    const tx = await rpc
      .getTransaction(sigInfo.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
        encoding: "jsonParsed",
      })
      .send();

    if (!tx?.meta?.logMessages) continue;

    // Find program data logs
    const programDataLogs = tx.meta.logMessages.filter((log) =>
      log.startsWith("Program data: "),
    );

    for (const log of programDataLogs) {
      const base64Data = log.replace("Program data: ", "");
      const buffer = Buffer.from(base64Data, "base64");
      const logType = readU8(buffer, 0);

      // Only process fill orders (18=Spot, 19=Perp)
      if (logType === 18 || logType === 19) {
        const decoded = decodeFillOrderReport(base64Data, logType);

        if (decoded) {
          const trade: DecodedTrade = {
            signature: sigInfo.signature.slice(0, 16) + "...",
            type: logType === 18 ? "SPOT" : "PERP",
            side: decoded.side,
            price: decoded.price,
            quantity: decoded.quantity,
            timestamp: sigInfo.blockTime
              ? new Date(Number(sigInfo.blockTime) * 1000).toLocaleString()
              : "N/A",
            blockTime: Number(sigInfo.blockTime || 0),
            orderId: decoded.clientId,
            clientId: decoded.clientId,
            instrumentId: decoded.instrumentId,
          };

          trades.push(trade);
        }
      }
    }
  }

  console.log(`✅ Found ${trades.length} trades\n`);
  return trades;
}

/**
 * Get summary statistics
 */
export function getTradeSummary(trades: DecodedTrade[]) {
  const spotTrades = trades.filter((t) => t.type === "SPOT");
  const perpTrades = trades.filter((t) => t.type === "PERP");
  const buyTrades = trades.filter((t) => t.side === "BUY");
  const sellTrades = trades.filter((t) => t.side === "SELL");

  const totalVolume = trades.reduce((sum, t) => sum + t.price * t.quantity, 0);

  return {
    totalTrades: trades.length,
    spotTrades: spotTrades.length,
    perpTrades: perpTrades.length,
    buyTrades: buyTrades.length,
    sellTrades: sellTrades.length,
    totalVolume,
    avgPrice:
      trades.length > 0
        ? trades.reduce((sum, t) => sum + t.price, 0) / trades.length
        : 0,
    avgQuantity:
      trades.length > 0
        ? trades.reduce((sum, t) => sum + t.quantity, 0) / trades.length
        : 0,
  };
}

// Test it
async function test() {
  const trades = await fetchAllTrades(WALLET, 100);

  console.log("📊 TRADES FOUND:");
  console.log("─".repeat(80));
  console.table(trades);

  const summary = getTradeSummary(trades);
  console.log("\n📈 SUMMARY:");
  console.log("─".repeat(40));
  console.log(`Total Trades: ${summary.totalTrades}`);
  console.log(`  ├─ Spot: ${summary.spotTrades}`);
  console.log(`  └─ Perp: ${summary.perpTrades}`);
  console.log(`Buy: ${summary.buyTrades} | Sell: ${summary.sellTrades}`);
  console.log(`Total Volume: $${summary.totalVolume.toFixed(2)}`);
  console.log(`Avg Price: $${summary.avgPrice.toFixed(4)}`);
  console.log(`Avg Qty: ${summary.avgQuantity.toFixed(4)}`);
}

test().catch(console.error);
