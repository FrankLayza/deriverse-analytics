// Core Trading Types
export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  fees: number;
  duration: number; // in seconds
  orderType: 'market' | 'limit';
  notes?: string;
}

export interface PortfolioMetrics {
  totalPnl: number;
  totalVolume: number;
  totalFees: number;
  winRate: number;
  totalTrades: number;
  avgTradeDuration: number;
  longShortRatio: number;
  largestGain: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface TimeSeriesData {
  timestamp: number;
  pnl: number;
  cumulativePnl: number;
  volume: number;
  trades: number;
}

export interface SymbolPerformance {
  symbol: string;
  trades: number;
  pnl: number;
  winRate: number;
  volume: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  symbols: string[];
  dateRange: DateRange;
  side?: 'long' | 'short' | 'all';
}
