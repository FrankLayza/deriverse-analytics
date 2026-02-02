import { Trade } from '@/types';

/**
 * Generate mock trading data for development
 * Replace this with actual Solana blockchain data fetching
 */
export function generateMockTrades(count: number = 50): Trade[] {
  const symbols = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'BONK/USDC', 'JUP/USDC'];
  const sides: ('long' | 'short')[] = ['long', 'short'];
  const orderTypes: ('market' | 'limit')[] = ['market', 'limit'];
  
  const trades: Trade[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 3600000 * Math.random() * 24; // Random time in last days
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    
    const entryPrice = 50 + Math.random() * 200;
    const priceChange = (Math.random() - 0.45) * entryPrice * 0.1; // Slight bias toward wins
    const exitPrice = entryPrice + priceChange;
    
    const size = 0.1 + Math.random() * 5;
    const pnl = (exitPrice - entryPrice) * size * (side === 'short' ? -1 : 1);
    const fees = size * entryPrice * 0.001; // 0.1% fee
    const duration = Math.floor(Math.random() * 86400); // Up to 24 hours
    
    trades.push({
      id: `trade_${i}_${timestamp}`,
      timestamp,
      symbol,
      side,
      entryPrice,
      exitPrice,
      size,
      pnl,
      fees,
      duration,
      orderType,
    });
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp);
}
