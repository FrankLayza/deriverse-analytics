/**
 * Analytics Calculations Library
 * All calculation functions for the Deriverse Analytics Dashboard
 * Works with Supabase data types
 */

import type { Trade } from "@/utils/supabase";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert string to number (Supabase stores decimals as strings)
 */
function toNumber(value: string | null | undefined): number {
  return parseFloat(value || "0");
}

/**
 * Convert number to string for Supabase storage
 */
function toString(value: number): string {
  return value.toString();
}

// ============================================================================
// CORE METRICS CALCULATIONS
// ============================================================================

export interface CoreMetrics {
  totalPnL: number;
  totalVolume: number;
  totalFees: number;
  netPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
}

// ============================================================================
// DYNAMIC PNL ENRICHMENT ENGINE
// ============================================================================

/**
 * Takes raw trades from the database (which might have 0 PnL) and
 * dynamically calculates the true Realized PnL based on execution history.
 */
export function enrichTradesWithPnL(trades: Trade[]): Trade[] {
  if (!trades || trades.length === 0) return [];

  // 1. Sort trades chronologically (oldest to newest) so the math flows forward in time
  const sortedTrades = [...trades].sort(
    (a, b) =>
      new Date(a.block_time).getTime() - new Date(b.block_time).getTime(),
  );

  // 2. Group by instrument_id (We must track positions for each token separately)
  const tradesByInstrument = new Map<string, Trade[]>();
  sortedTrades.forEach((t) => {
    const id = String(t.instrument_id);
    if (!tradesByInstrument.has(id)) tradesByInstrument.set(id, []);
    tradesByInstrument.get(id)!.push(t);
  });

  const enrichedTrades: Trade[] = [];

  // 3. Process each instrument independently
  tradesByInstrument.forEach((instrumentTrades) => {
    let currentPosition = 0;
    let avgEntryPrice = 0;

    instrumentTrades.forEach((trade) => {
      const side = trade.side?.toUpperCase() || "BUY";
      const price = toNumber(trade.price);
      const size = toNumber(trade.quantity);
      let realizedPnl = 0;

      if (side === "BUY") {
        if (currentPosition < 0) {
          // Closing a Short Position
          const sizeClosed = Math.min(Math.abs(currentPosition), size);
          realizedPnl = (avgEntryPrice - price) * sizeClosed;

          currentPosition += size;
          if (currentPosition > 0)
            avgEntryPrice = price; // Flipped to Long
          else if (currentPosition === 0) avgEntryPrice = 0;
        } else {
          // Opening/Adding to a Long Position
          const totalValue = currentPosition * avgEntryPrice + size * price;
          currentPosition += size;
          avgEntryPrice =
            currentPosition === 0 ? 0 : totalValue / currentPosition;
        }
      } else if (side === "SELL") {
        if (currentPosition > 0) {
          // Closing a Long Position
          const sizeClosed = Math.min(currentPosition, size);
          realizedPnl = (price - avgEntryPrice) * sizeClosed;

          currentPosition -= size;
          if (currentPosition < 0)
            avgEntryPrice = price; // Flipped to Short
          else if (currentPosition === 0) avgEntryPrice = 0;
        } else {
          // Opening/Adding to a Short Position
          const totalValue =
            Math.abs(currentPosition) * avgEntryPrice + size * price;
          currentPosition -= size;
          avgEntryPrice =
            currentPosition === 0 ? 0 : totalValue / Math.abs(currentPosition);
        }
      }

      // 4. Create a new enriched trade object
      enrichedTrades.push({
        ...trade,
        realized_pnl: realizedPnl.toString(),
      });
    });
  });

  // 5. Re-sort from Newest to Oldest (standard dashboard display format)
  return enrichedTrades.sort(
    (a, b) =>
      new Date(b.block_time).getTime() - new Date(a.block_time).getTime(),
  );
}

/**
 * Calculate core metrics for dashboard cards
 * Used for: Total PnL Card, Volume Card, Fees Card
 */
export function calculateCoreMetrics(trades: Trade[]): CoreMetrics {
  if (!trades || trades.length === 0) {
    return {
      totalPnL: 0,
      totalVolume: 0,
      totalFees: 0,
      netPnL: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
    };
  }

  const totalPnL = trades.reduce((sum, t) => sum + toNumber(t.realized_pnl), 0);
  const totalVolume = trades.reduce(
    (sum, t) => sum + toNumber(t.price) * toNumber(t.quantity),
    0,
  );
  const totalFees = trades.reduce((sum, t) => sum + toNumber(t.fees), 0);

  const winningTrades = trades.filter(
    (t) => toNumber(t.realized_pnl) > 0,
  ).length;
  const losingTrades = trades.filter(
    (t) => toNumber(t.realized_pnl) < 0,
  ).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  return {
    totalPnL,
    totalVolume,
    totalFees,
    netPnL: totalPnL - totalFees,
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate,
  };
}

// ============================================================================
// LONG/SHORT RATIO
// ============================================================================

export interface LongShortMetrics {
  longTrades: number;
  shortTrades: number;
  longVolume: number;
  shortVolume: number;
  ratio: number;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
}

/**
 * Calculate Long/Short ratio
 * Used for: Long/Short Card
 */
export function calculateLongShortRatio(trades: Trade[]): LongShortMetrics {
  if (!trades || trades.length === 0) {
    return {
      longTrades: 0,
      shortTrades: 0,
      longVolume: 0,
      shortVolume: 0,
      ratio: 0,
      bias: "NEUTRAL",
    };
  }

  const longs = trades.filter((t) => {
    const side = t.side?.toUpperCase() || t.side?.toLowerCase();
    return side === "BUY" || side === "buy";
  });
  const shorts = trades.filter((t) => {
    const side = t.side?.toUpperCase() || t.side?.toLowerCase();
    return side === "SELL" || side === "sell";
  }); 

  const longVolume = longs.reduce(
    (sum, t) => sum + toNumber(t.price) * toNumber(t.quantity),
    0,
  );
  const shortVolume = shorts.reduce(
    (sum, t) => sum + toNumber(t.price) * toNumber(t.quantity),
    0,
  );

  const ratio = shorts.length > 0 ? longs.length / shorts.length : longs.length;

  let bias: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  if (ratio > 1.2) bias = "BULLISH";
  else if (ratio < 0.8) bias = "BEARISH";

  return {
    longTrades: longs.length,
    shortTrades: shorts.length,
    longVolume,
    shortVolume,
    ratio,
    bias,
  };
}

// ============================================================================
// RISK & AVERAGES
// ============================================================================

export interface RiskMetrics {
  largestGain: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  avgTradeDuration: number; // in milliseconds
}

/**
 * Calculate risk and average metrics
 * Used for: Risk & Averages Card
 */
export function calculateRiskMetrics(trades: Trade[]): RiskMetrics {
  if (!trades || trades.length === 0) {
    return {
      largestGain: 0,
      largestLoss: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      avgTradeDuration: 0,
    };
  }

  const pnls = trades.map((t) => toNumber(t.realized_pnl));
  const wins = trades.filter((t) => toNumber(t.realized_pnl) > 0);
  const losses = trades.filter((t) => toNumber(t.realized_pnl) < 0);

  const largestGain = pnls.length > 0 ? Math.max(...pnls) : 0;
  const largestLoss = pnls.length > 0 ? Math.min(...pnls) : 0;

  const totalWins = wins.reduce((sum, t) => sum + toNumber(t.realized_pnl), 0);
  const totalLosses = Math.abs(
    losses.reduce((sum, t) => sum + toNumber(t.realized_pnl), 0),
  );

  const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

  // Calculate average trade duration (simplified - assumes trades are ordered)
  const avgTradeDuration = calculateAverageDuration(trades);

  return {
    largestGain,
    largestLoss,
    avgWin,
    avgLoss,
    profitFactor,
    avgTradeDuration,
  };
}

/**
 * Calculate average trade duration
 */
function calculateAverageDuration(trades: Trade[]): number {
  if (trades.length < 2) return 0;

  // Sort by execution time
  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.block_time).getTime() - new Date(b.block_time).getTime(),
  );

  // Group by instrument_id to match buy/sell pairs
  const bySymbol = new Map<string, Trade[]>();
  sorted.forEach((trade) => {
    const instId = String(trade.instrument_id);
    if (!bySymbol.has(instId)) {
      bySymbol.set(instId, []);
    }
    bySymbol.get(instId)!.push(trade);
  });

  let totalDuration = 0;
  let pairs = 0;

  // Match buy/sell pairs per symbol
  bySymbol.forEach((symbolTrades) => {
    const buys = symbolTrades.filter((t) => t.side === "buy");
    const sells = symbolTrades.filter((t) => t.side === "sell");

    const pairCount = Math.min(buys.length, sells.length);

    for (let i = 0; i < pairCount; i++) {
      const buyTime = new Date(buys[i].block_time).getTime();
      const sellTime = new Date(sells[i].block_time).getTime();
      totalDuration += Math.abs(sellTime - buyTime);
      pairs++;
    }
  });

  return pairs > 0 ? totalDuration / pairs : 0;
}

// ============================================================================
// HISTORICAL PNL (TIME SERIES)
// ============================================================================

export interface PnLTimeSeriesPoint {
  timestamp: number;
  date: string;
  cumulativePnL: number;
  tradePnL: number;
}

/**
 * Generate time series data for PnL chart
 * Used for: Historical PnL Chart
 */
export function generatePnLTimeSeries(trades: Trade[]): PnLTimeSeriesPoint[] {
  if (!trades || trades.length === 0) return [];

  // Sort by execution time
  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.block_time).getTime() - new Date(b.block_time).getTime(),
  );

  let cumulative = 0;

  return sorted.map((trade) => {
    const tradePnL = toNumber(trade.realized_pnl);
    cumulative += tradePnL;

    return {
      timestamp: new Date(trade.block_time).getTime(),
      date: new Date(trade.block_time).toLocaleDateString(),
      cumulativePnL: cumulative,
      tradePnL,
    };
  });
}

// ============================================================================
// DRAWDOWN CALCULATION
// ============================================================================

export interface DrawdownData {
  maxDrawdown: number;
  currentDrawdown: number;
  drawdownSeries: Array<{
    timestamp: number;
    date: string;
    drawdown: number;
    peak: number;
  }>;
}

/**
 * Calculate drawdown metrics
 * Used for: Drawdown Chart
 */
export function calculateDrawdown(trades: Trade[]): DrawdownData {
  if (!trades || trades.length === 0) {
    return {
      maxDrawdown: 0,
      currentDrawdown: 0,
      drawdownSeries: [],
    };
  }

  // Sort by execution time
  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.block_time).getTime() - new Date(b.block_time).getTime(),
  );

  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;
  const drawdownSeries = [];

  for (const trade of sorted) {
    cumulative += toNumber(trade.realized_pnl);

    // Update peak
    if (cumulative > peak) {
      peak = cumulative;
    }

    // Calculate current drawdown
    const currentDrawdown = peak - cumulative;

    // Update max drawdown
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    drawdownSeries.push({
      timestamp: new Date(trade.block_time).getTime(),
      date: new Date(trade.block_time).toLocaleDateString(),
      drawdown: -currentDrawdown, // Negative for visual display
      peak,
    });
  }

  return {
    maxDrawdown,
    currentDrawdown: peak - cumulative,
    drawdownSeries,
  };
}

// ============================================================================
// FEE COMPOSITION
// ============================================================================

export interface FeeComposition {
  spotFees: number;
  perpFees: number;
  totalFees: number;
  feesBySymbol: Array<{
    symbol: string;
    fees: number;
    percentage: number;
  }>;
}

/**
 * Calculate fee composition
 * Used for: Fee Composition Pie Chart
 */
export function calculateFeeComposition(trades: Trade[]): FeeComposition {
  if (!trades || trades.length === 0) {
    return {
      spotFees: 0,
      perpFees: 0,
      totalFees: 0,
      feesBySymbol: [],
    };
  }

  const spotFees = trades
    .filter((t) => t.order_type?.toUpperCase() === "SPOT")
    .reduce((sum, t) => sum + Math.abs(toNumber(t.fees)), 0);

  const perpFees = trades
    .filter((t) => t.order_type?.toUpperCase() === "PERP")
    .reduce((sum, t) => sum + Math.abs(toNumber(t.fees)), 0);

  const totalFees = spotFees + perpFees;

  // Group by instrument_id
  const feesBySymbol = new Map<string, number>();
  trades.forEach((trade) => {
    const instId = String(trade.instrument_id);
    const current = feesBySymbol.get(instId) || 0;
    feesBySymbol.set(instId, current + Math.abs(toNumber(trade.fees)));
  });

  const feesBySymbolArray = Array.from(feesBySymbol.entries())
    .map(([symbol, fees]) => ({
      symbol: `Inst #${symbol}`,
      fees,
      percentage: totalFees > 0 ? (fees / totalFees) * 100 : 0,
    }))
    .sort((a, b) => b.fees - a.fees);

  return {
    spotFees,
    perpFees,
    totalFees,
    feesBySymbol: feesBySymbolArray,
  };
}

// ============================================================================
// SESSION PERFORMANCE
// ============================================================================

export interface SessionPerformance {
  totalSessions: number;
  profitableSessions: number;
  losingSessionsCount: number;
  avgPnLPerSession: number;
  bestSession: {
    date: string;
    pnl: number;
  } | null;
  worstSession: {
    date: string;
    pnl: number;
  } | null;
  sessionData: Array<{
    date: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
}

/**
 * Calculate session-based performance
 * Used for: Session Performance Pie Chart
 */
export function calculateSessionPerformance(
  trades: Trade[],
): SessionPerformance {
  if (!trades || trades.length === 0) {
    return {
      totalSessions: 0,
      profitableSessions: 0,
      losingSessionsCount: 0,
      avgPnLPerSession: 0,
      bestSession: null,
      worstSession: null,
      sessionData: [],
    };
  }

  // Group trades by date
  const sessionMap = new Map<string, Trade[]>();

  trades.forEach((trade) => {
    const date = new Date(trade.block_time).toISOString().split("T")[0];
    if (!sessionMap.has(date)) {
      sessionMap.set(date, []);
    }
    sessionMap.get(date)!.push(trade);
  });

  // Calculate metrics per session
  const sessionData = Array.from(sessionMap.entries()).map(
    ([date, dayTrades]) => {
      const pnl = dayTrades.reduce(
        (sum, t) => sum + toNumber(t.realized_pnl),
        0,
      );
      const wins = dayTrades.filter((t) => toNumber(t.realized_pnl) > 0).length;
      const winRate = (wins / dayTrades.length) * 100;

      return {
        date,
        trades: dayTrades.length,
        pnl,
        winRate,
      };
    },
  );

  const profitableSessions = sessionData.filter((s) => s.pnl > 0).length;
  const losingSessionsCount = sessionData.filter((s) => s.pnl < 0).length;
  const totalPnL = sessionData.reduce((sum, s) => sum + s.pnl, 0);
  const avgPnLPerSession =
    sessionData.length > 0 ? totalPnL / sessionData.length : 0;

  // Find best and worst sessions
  const sortedByPnL = [...sessionData].sort((a, b) => b.pnl - a.pnl);
  const bestSession =
    sortedByPnL.length > 0
      ? { date: sortedByPnL[0].date, pnl: sortedByPnL[0].pnl }
      : null;
  const worstSession =
    sortedByPnL.length > 0
      ? {
          date: sortedByPnL[sortedByPnL.length - 1].date,
          pnl: sortedByPnL[sortedByPnL.length - 1].pnl,
        }
      : null;

  return {
    totalSessions: sessionData.length,
    profitableSessions,
    losingSessionsCount,
    avgPnLPerSession,
    bestSession,
    worstSession,
    sessionData,
  };
}

// ============================================================================
// TIME-BASED ANALYSIS
// ============================================================================

export interface TimeBasedMetrics {
  byHour: Array<{ hour: string; trades: number; pnl: number; avgPnL: number }>;
  byDayOfWeek: Array<{
    day: string;
    trades: number;
    pnl: number;
    avgPnL: number;
  }>;
  byMonth: Array<{
    month: string;
    trades: number;
    pnl: number;
    avgPnL: number;
  }>;
}

/**
 * Calculate time-based performance metrics
 * Used for: Additional analytics
 */
export function calculateTimeBasedMetrics(trades: Trade[]): TimeBasedMetrics {
  if (!trades || trades.length === 0) {
    return {
      byHour: [],
      byDayOfWeek: [],
      byMonth: [],
    };
  }

  // By Hour (0-23)
  const hourData = Array(24)
    .fill(0)
    .map((_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      trades: 0,
      pnl: 0,
      avgPnL: 0,
    }));

  // By Day of Week (0-6)
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayData = days.map((day) => ({
    day,
    trades: 0,
    pnl: 0,
    avgPnL: 0,
  }));

  // By Month
  const monthMap = new Map<string, { trades: number; pnl: number }>();

  trades.forEach((trade) => {
    const date = new Date(trade.block_time);
    const tradePnL = toNumber(trade.realized_pnl);

    // Hour
    const hour = date.getHours();
    hourData[hour].trades++;
    hourData[hour].pnl += tradePnL;

    // Day of week
    const dayOfWeek = date.getDay();
    dayData[dayOfWeek].trades++;
    dayData[dayOfWeek].pnl += tradePnL;

    // Month
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!monthMap.has(month)) {
      monthMap.set(month, { trades: 0, pnl: 0 });
    }
    const monthData = monthMap.get(month)!;
    monthData.trades++;
    monthData.pnl += tradePnL;
  });

  // Calculate averages
  hourData.forEach((h) => {
    h.avgPnL = h.trades > 0 ? h.pnl / h.trades : 0;
  });
  dayData.forEach((d) => {
    d.avgPnL = d.trades > 0 ? d.pnl / d.trades : 0;
  });

  const byMonth = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      trades: data.trades,
      pnl: data.pnl,
      avgPnL: data.pnl / data.trades,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    byHour: hourData,
    byDayOfWeek: dayData,
    byMonth,
  };
}

// ============================================================================
// TRADE JOURNAL DATA
// ============================================================================

export interface TradeJournalEntry extends Trade {
  formattedPrice: string;
  formattedQuantity: string;
  formattedPnL: string;
  formattedFees: string;
  formattedDate: string;
  pnLClass: "profit" | "loss" | "neutral";
  symbol: string; // explicitly typing the added field
}

/**
 * Format trades for journal table display
 * Used for: Trade Journal Table
 */
export function formatTradesForJournal(trades: Trade[]): TradeJournalEntry[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return trades.map((trade) => {
    const date = new Date(trade.block_time);
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Extract base asset from symbol (e.g., "SOL/USD" → "SOL", "SOL-PERP" → "SOL")
    const symbol = trade.symbol || `Inst #${trade.instrument_id}`;
    let baseAsset = symbol;
    const slashIdx = symbol.indexOf('/');
    if (slashIdx > 0) baseAsset = symbol.substring(0, slashIdx);
    else {
      const dashIdx = symbol.indexOf('-');
      if (dashIdx > 0) baseAsset = symbol.substring(0, dashIdx);
    }

    const qty = toNumber(trade.quantity);

    return {
      ...trade,
      formattedPrice: `$${toNumber(trade.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      formattedQuantity: toNumber(trade.quantity).toFixed(4),
      formattedPnL: `${toNumber(trade.realized_pnl) >= 0 ? "+" : ""}$${toNumber(trade.realized_pnl).toFixed(2)}`,
      formattedFees: `$${Math.abs(toNumber(trade.fees)).toFixed(6)}`,
      formattedDate: `${month} ${day}, ${hours}:${minutes}:${seconds}`,
      pnLClass:
        toNumber(trade.realized_pnl) > 0
          ? "profit"
          : toNumber(trade.realized_pnl) < 0
            ? "loss"
            : "neutral",
      symbol,
    };
  });
}
