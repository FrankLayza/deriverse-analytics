/**
 * Deriverse Trade Fetcher Service
 * Fetches and decodes trades from Solana blockchain
 */

import { createSolanaRpc, address, devnet } from '@solana/kit';
import { Engine, PROGRAM_ID } from '@deriverse/kit';

export interface DecodedTrade {
  signature: string;
  type: 'SPOT' | 'PERP';
  side: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  quantity: number;
  fees: number;
  pnl: number;
  orderType: 'MARKET' | 'LIMIT';
  instrumentId: number;
  clientId: number;
  blockTime: number;
  executedAt: Date;
}

// Binary read helpers
function readU8(buffer: Buffer, offset: number): number {
  return buffer.readUInt8(offset);
}

function readU32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function readI64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigInt64LE(offset);
}

/**
 * Decode Deriverse Fill Order Report from base64 program data
 */
function decodeFillOrderReport(base64Data: string, logType: number): any {
  const buffer = Buffer.from(base64Data, 'base64');
  
  try {
    const flags = readU32LE(buffer, 1);
    const clientId = readU32LE(buffer, 5);
    const instrumentId = readU32LE(buffer, 9);
    const priceRaw = readI64LE(buffer, 13);
    const qtyRaw = readI64LE(buffer, 21);
    
    // Side: 0=BUY, 1=SELL (from flags)
    const side = (flags & 1) === 0 ? 'BUY' : 'SELL';
    
    // Convert fixed-point to decimal (Deriverse uses 9 decimals)
    const DECIMALS = 1_000_000_000;
    const price = Number(priceRaw) / DECIMALS;
    const quantity = Number(qtyRaw) / DECIMALS;
    
    return {
      logType,
      clientId,
      instrumentId,
      side,
      price,
      quantity,
    };
  } catch (error) {
    console.error('Decode error:', error);
    return null;
  }
}

/**
 * Map instrument ID to symbol
 * TODO: Make this dynamic by querying Deriverse markets
 */
function getSymbolFromInstrumentId(instrumentId: number): string {
  const symbolMap: Record<number, string> = {
    0: 'SOL/USDC',
    1: 'BTC/USDC',
    2: 'ETH/USDC',
    // Add more as discovered
  };
  return symbolMap[instrumentId] || `INSTRUMENT_${instrumentId}`;
}

/**
 * Fetch all trades for a wallet from Deriverse
 */
export async function fetchDeriverseTrades(
  walletAddress: string,
  limit: number = 100
): Promise<DecodedTrade[]> {
  console.log(`[Deriverse] Fetching trades for ${walletAddress}`);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_HTTP || 'https://api.devnet.solana.com';
  const rpc = createSolanaRpc(devnet(rpcUrl));
  
  // Create engine (don't call initialize - it's broken)
  const engine = new Engine(rpc, { 
    programId: PROGRAM_ID, 
    version: 1 
  });

  try {
    // Fetch transaction signatures
    const signatures = await rpc
      .getSignaturesForAddress(address(walletAddress), { limit })
      .send();

    console.log(`[Deriverse] Found ${signatures.length} transactions`);

    const trades: DecodedTrade[] = [];

    // Process each transaction
    for (const sigInfo of signatures) {
      try {
        const tx = await rpc.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
          encoding: 'jsonParsed',
        }).send();

        if (!tx?.meta?.logMessages) continue;

        // Extract program data logs
        const programDataLogs = tx.meta.logMessages.filter(log => 
          log.startsWith('Program data: ')
        );

        // Decode each log
        for (const log of programDataLogs) {
          const base64Data = log.replace('Program data: ', '');
          const buffer = Buffer.from(base64Data, 'base64');
          const logType = readU8(buffer, 0);

          // Process fill orders only (18=Spot, 19=Perp)
          if (logType === 18 || logType === 19) {
            const decoded = decodeFillOrderReport(base64Data, logType);
            
            if (decoded && decoded.price > 0 && decoded.quantity > 0) {
              const symbol = getSymbolFromInstrumentId(decoded.instrumentId);
              const executedAt = new Date(Number(sigInfo.blockTime || 0) * 1000);

              const trade: DecodedTrade = {
                signature: sigInfo.signature,
                type: logType === 18 ? 'SPOT' : 'PERP',
                side: decoded.side,
                symbol,
                price: decoded.price,
                quantity: decoded.quantity,
                fees: 0, // Calculate from transaction
                pnl: 0, // Will calculate when matching orders
                orderType: 'MARKET', // Default, can enhance later
                instrumentId: decoded.instrumentId,
                clientId: decoded.clientId,
                blockTime: Number(sigInfo.blockTime || 0),
                executedAt,
              };

              trades.push(trade);
            }
          }
        }
      } catch (err) {
        // Skip failed transactions
        continue;
      }
    }

    console.log(`[Deriverse] Decoded ${trades.length} trades`);
    return trades;

  } catch (error) {
    console.error('[Deriverse] Error fetching trades:', error);
    throw error;
  }
}

/**
 * Calculate PnL by matching buy/sell orders
 */
export function calculatePnL(trades: DecodedTrade[]): DecodedTrade[] {
  const tradesWithPnL = [...trades];
  const tradesBySymbol = new Map<string, DecodedTrade[]>();
  
  // Group by symbol
  for (const trade of tradesWithPnL) {
    if (!tradesBySymbol.has(trade.symbol)) {
      tradesBySymbol.set(trade.symbol, []);
    }
    tradesBySymbol.get(trade.symbol)!.push(trade);
  }

  // Match orders per symbol
  for (const [symbol, symbolTrades] of tradesBySymbol) {
    const buys = symbolTrades.filter(t => t.side === 'BUY').sort((a, b) => a.blockTime - b.blockTime);
    const sells = symbolTrades.filter(t => t.side === 'SELL').sort((a, b) => a.blockTime - b.blockTime);

    // Simple FIFO matching
    while (buys.length > 0 && sells.length > 0) {
      const buy = buys.shift()!;
      const sell = sells.shift()!;

      const matchedQty = Math.min(buy.quantity, sell.quantity);
      const pnl = (sell.price - buy.price) * matchedQty;

      // Assign PnL to the closing trade (sell)
      sell.pnl = pnl;
    }
  }

  return tradesWithPnL;
}
