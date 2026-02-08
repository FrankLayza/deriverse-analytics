import { SpotFillOrderReportModel } from "@deriverse/kit";

export interface Trade {
  signature: string;
  timestamp: number;
  type: 'SPOT' | 'PERP';
  side: 'BUY' | 'SELL';
  asset: string;
  price: number;
  qty: number;
  fee: number;
  quoteAmount: number; // price * qty
}

/**
 * 1. Calculate Cumulative Volume
 */
export const calculateTotalVolume = (trades: Trade[]) => {
  return trades.reduce((sum, trade) => sum + trade.quoteAmount, 0);
};

/**
 * 2. Calculate Total Fees Paid
 */
export const calculateTotalFees = (trades: Trade[]) => {
  return trades.reduce((sum, trade) => sum + trade.fee, 0);
};

/**
 * 3. Calculate Win Rate (%)
 * (Note: Real win rate requires tracking open/close pairs, 
 * but for a journal, we can start with simple price-basis)
 */
export const calculateWinRate = (trades: Trade[]) => {
  if (trades.length === 0) return 0;
  // Placeholder logic: You can refine this based on entry/exit logic
  const winningTrades = trades.filter(t => t.quoteAmount > 0); // Simplified
  return (winningTrades.length / trades.length) * 100;
};

/**
 * 4. Generate PnL Chart Data (Cumulative)
 */
export const generatePnLSeries = (trades: Trade[]) => {
  let cumulativePnL = 0;
  return trades.sort((a, b) => a.timestamp - b.timestamp).map(trade => {
    // This logic will be expanded once we calculate profit per trade
    // For now, it maps the timeline
    return {
      time: new Date(trade.timestamp).toLocaleTimeString(),
      pnl: cumulativePnL
    };
  });
};