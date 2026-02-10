'use client'

import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react'

export function HeroMetrics() {
  return (
    <div className="grid grid-cols-4 gap-4 px-6 py-6">
      {/* Total PnL */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total PnL
          </span>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="mb-3 flex items-end gap-3">
          <div className="font-mono text-2xl font-bold text-primary">$12,847.32</div>
          <div className="mb-1 h-6 flex-1 rounded-sm bg-linear-to-r from-primary/20 to-primary/40">
            <div
              className="flex h-full flex-col justify-end rounded-sm bg-linear-to-r from-primary to-primary/80"
              style={{ width: '75%' }}
            >
              <div className="h-0.5 bg-primary/60" />
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">↑ 23.5% last 30 days</div>
      </div>

      {/* Total Volume & Cumulative Fees */}
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
            <div className="font-mono text-lg font-bold text-foreground">$284,562.15</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fees Paid</div>
            <div className="font-mono text-lg font-bold text-foreground">$1,245.20</div>
          </div>
        </div>
      </div>

      {/* Win Rate */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Win Rate
          </span>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end gap-4">
          <div>
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="hsl(240 8% 15%)"
                  strokeWidth="3"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="hsl(132 63% 47%)"
                  strokeWidth="3"
                  strokeDasharray={`${28 * 2 * Math.PI * 0.68} ${28 * 2 * Math.PI}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                68%
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Trades</div>
            <div className="font-mono text-xl font-bold text-foreground">247</div>
          </div>
        </div>
      </div>

      {/* Long/Short Ratio */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Long/Short
          </span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Long</span>
            <div className="flex-1 overflow-hidden rounded-sm bg-muted">
              <div
                className="h-2 bg-primary"
                style={{ width: '60%' }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-foreground">60%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Short</span>
            <div className="flex-1 overflow-hidden rounded-sm bg-muted">
              <div
                className="h-2 bg-secondary"
                style={{ width: '40%' }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-foreground">40%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
