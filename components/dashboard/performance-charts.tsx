'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { PnLTimeSeriesPoint, DrawdownData, RiskMetrics } from '@/lib/calculations'

interface PerformanceChartsProps {
  pnlSeries: PnLTimeSeriesPoint[];
  drawdown: DrawdownData;
  risk: RiskMetrics;
}

/**
 * Formats milliseconds into a readable duration (e.g., "1d 4h" or "4h 32m")
 */
function formatDuration(ms: number) {
  if (!ms || ms === 0) return '0m';
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function PerformanceCharts({ pnlSeries, drawdown, risk }: PerformanceChartsProps) {
  const [timeframe, setTimeframe] = useState('All');

  // Combine PnL and Drawdown series into one data array for Recharts
  // Since both were generated from the same sorted trade list, indices match perfectly.
  const chartData = useMemo(() => {
    return pnlSeries.map((point, index) => ({
      date: point.date,
      pnl: point.cumulativePnL,
      drawdown: drawdown.drawdownSeries[index]?.drawdown || 0,
    }));
  }, [pnlSeries, drawdown]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 py-6">
      {/* PnL & Drawdown Chart - 2/3 width */}
      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Historical PnL & Drawdown
          </h3>
          <div className="flex gap-2">
            {['1D', '1W', '1M', 'All'].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={timeframe === t ? 'default' : 'outline'}
                className={`h-7 px-3 text-xs font-medium ${
                  timeframe === t
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setTimeframe(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <ChartContainer
          config={{
            pnl: {
              label: 'PnL',
              color: 'hsl(var(--primary))',
            },
            drawdown: {
              label: 'Drawdown',
              color: 'hsl(var(--secondary))',
            },
          }}
          className="h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="rounded border border-border bg-card p-2 shadow-lg">
                        <p className="mb-1 text-[10px] text-muted-foreground font-mono">{payload[0].payload.date}</p>
                        {payload.map((entry, index) => (
                          <div
                            key={index}
                            className="font-mono text-xs flex justify-between gap-4"
                            style={{ color: entry.color }}
                          >
                            <span>{entry.name}:</span>
                            <span className="font-bold">${entry.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorPnl)"
                name="PnL"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="hsl(var(--secondary))"
                fillOpacity={1}
                fill="url(#colorDrawdown)"
                name="Drawdown"
                strokeWidth={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Risk Management Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Risk & Averages
        </h3>
        <div className="space-y-3">
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Largest Gain</div>
            <div className="font-mono text-sm font-bold text-primary">
              +${risk.largestGain.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Largest Loss</div>
            <div className="font-mono text-sm font-bold text-secondary">
              -${Math.abs(risk.largestLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Avg Win Amount</div>
            <div className="font-mono text-sm font-bold text-foreground">
              +${risk.avgWin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Avg Loss Amount</div>
            <div className="font-mono text-sm font-bold text-foreground">
              -${Math.abs(risk.avgLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Profit Factor</div>
            <div className="font-mono text-sm font-bold text-foreground">
              {risk.profitFactor.toFixed(2)}x
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Trade Duration</div>
            <div className="font-mono text-sm font-bold text-foreground">
              {formatDuration(risk.avgTradeDuration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}