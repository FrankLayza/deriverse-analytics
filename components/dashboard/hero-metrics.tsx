"use client";

import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Target,
} from "lucide-react";
import type { CoreMetrics, LongShortMetrics } from "@/lib/calculations";

interface HeroMetricsProps {
  core: CoreMetrics;
  longShort: LongShortMetrics;
}

export function HeroMetrics({ core, longShort }: HeroMetricsProps) {
  // Win rate percentage for the SVG circle dash array
  const winRateValue = core.winRate / 100;
  const totalTrades = longShort.longTrades + longShort.shortTrades;
  const longPercentage =
    totalTrades > 0 ? (longShort.longTrades / totalTrades) * 100 : 50; // Default if no trades
  const shortPercentage = 100 - longPercentage;

  return (
    <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total PnL Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total PnL
          </span>
          {core.totalPnL >= 0 ? (
            <TrendingUp className="h-4 w-4 text-primary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div className="mt-4 mb-3 flex items-end gap-3">
          <div
            className={`font-jet text-3xl font-bold tracking-tight ${core.totalPnL >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {core.totalPnL >= 0 ? "+" : ""}$
            {core.totalPnL.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Net Profit: $
          {core.netPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* 2. Volume & Fees Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Volume & Fees
          </span>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">Volume</div>
            <div className="font-mono text-lg font-bold text-foreground">
              $
              {core.totalVolume.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fees Paid</div>
            <div className="font-mono text-lg font-bold text-foreground">
              $
              {Math.abs(core.totalFees).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Win Rate Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Win Rate
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="font-mono text-3xl font-bold text-foreground">
              {core.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {core.totalTrades} Trades Total
            </div>
          </div>
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="hsl(240, 5%, 20%)"
                strokeWidth="5"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="hsl(263, 70%, 55%)"
                strokeWidth="5"
                strokeDasharray={`${26 * 2 * Math.PI * winRateValue} ${26 * 2 * Math.PI}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              W/L
            </div>
          </div>
        </div>
      </div>

      {/* 4. Long/Short Ratio Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            L/S Ratio
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {longPercentage.toFixed(0)} / {shortPercentage.toFixed(0)}
          </span>
        </div>
        <div className="mt-6">
          {/* Combined progress bar */}
          <div className="flex w-full h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${longPercentage}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${shortPercentage}%` }}
            />
          </div>
          {/* Labels */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
              LONG ({longPercentage.toFixed(0)}%)
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
              SHORT ({shortPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
