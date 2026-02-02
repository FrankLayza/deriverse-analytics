import { Trade, PortfolioMetrics, TimeSeriesData, SymbolPerformance } from '@/types';

/**
 * Calculate comprehensive portfolio metrics from trades
 */
export function calculateMetrics(trades: Trade[]): PortfolioMetrics {
  if (trades.length === 0) {
    return {
      totalPnl: 0,
      totalVolume: 0,
      totalFees: 0,
      winRate: 0,
      totalTrades: 0,
      avgTradeDuration: 0,
      longShortRatio: 0,
      largestGain: 0,
      largestLoss: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
    };
  }

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalVolume = trades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const winRate = (winningTrades.length / trades.length) * 100;
  
  const avgTradeDuration = trades.reduce((sum, t) => sum + t.duration, 0) / trades.length;
  
  const longTrades = trades.filter(t => t.side === 'long').length;
  const shortTrades = trades.filter(t => t.side === 'short').length;
  const longShortRatio = shortTrades > 0 ? longTrades / shortTrades : longTrades;
  
  const largestGain = Math.max(...trades.map(t => t.pnl), 0);
  const largestLoss = Math.min(...trades.map(t => t.pnl), 0);
  
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;
  
  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 0;
  let cumulative = 0;
  
  trades.forEach(trade => {
    cumulative += trade.pnl;
    if (cumulative > peak) {
      peak = cumulative;
    }
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return {
    totalPnl,
    totalVolume,
    totalFees,
    winRate,
    totalTrades: trades.length,
    avgTradeDuration,
    longShortRatio,
    largestGain,
    largestLoss,
    avgWin,
    avgLoss,
    profitFactor,
    maxDrawdown,
  };
}

/**
 * Generate time series data for charts
 */
export function generateTimeSeriesData(trades: Trade[]): TimeSeriesData[] {
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const timeSeriesMap = new Map<number, TimeSeriesData>();
  
  let cumulativePnl = 0;
  
  sortedTrades.forEach(trade => {
    const dayTimestamp = new Date(trade.timestamp).setHours(0, 0, 0, 0);
    
    cumulativePnl += trade.pnl;
    
    if (!timeSeriesMap.has(dayTimestamp)) {
      timeSeriesMap.set(dayTimestamp, {
        timestamp: dayTimestamp,
        pnl: 0,
        cumulativePnl: 0,
        volume: 0,
        trades: 0,
      });
    }
    
    const data = timeSeriesMap.get(dayTimestamp)!;
    data.pnl += trade.pnl;
    data.cumulativePnl = cumulativePnl;
    data.volume += trade.entryPrice * trade.size;
    data.trades += 1;
  });
  
  return Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Calculate performance by symbol
 */
export function calculateSymbolPerformance(trades: Trade[]): SymbolPerformance[] {
  const symbolMap = new Map<string, SymbolPerformance>();
  
  trades.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, {
        symbol: trade.symbol,
        trades: 0,
        pnl: 0,
        winRate: 0,
        volume: 0,
      });
    }
    
    const perf = symbolMap.get(trade.symbol)!;
    perf.trades += 1;
    perf.pnl += trade.pnl;
    perf.volume += trade.entryPrice * trade.size;
  });
  
  // Calculate win rates
  symbolMap.forEach((perf, symbol) => {
    const symbolTrades = trades.filter(t => t.symbol === symbol);
    const wins = symbolTrades.filter(t => t.pnl > 0).length;
    perf.winRate = (wins / symbolTrades.length) * 100;
  });
  
  return Array.from(symbolMap.values()).sort((a, b) => b.pnl - a.pnl);
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format duration in human readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}
