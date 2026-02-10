'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
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

const pnlData = [
  { date: 'Jan 1', pnl: 0, drawdown: 0 },
  { date: 'Jan 5', pnl: 2450, drawdown: -150 },
  { date: 'Jan 10', pnl: 1890, drawdown: -560 },
  { date: 'Jan 15', pnl: 4230, drawdown: -120 },
  { date: 'Jan 20', pnl: 3950, drawdown: -280 },
  { date: 'Jan 25', pnl: 6200, drawdown: 0 },
  { date: 'Jan 30', pnl: 8450, drawdown: 0 },
  { date: 'Feb 1', pnl: 10120, drawdown: 0 },
  { date: 'Feb 5', pnl: 9200, drawdown: -920 },
  { date: 'Feb 10', pnl: 12847, drawdown: 0 },
]

export function PerformanceCharts() {
  const [timeframe, setTimeframe] = useState('1M')

  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-6">
      {/* PnL & Drawdown Chart - 2/3 width */}
      <div className="col-span-2 rounded-lg border border-border bg-card p-4">
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
              color: 'hsl(132 63% 47%)',
            },
            drawdown: {
              label: 'Drawdown',
              color: 'hsl(0 83% 53%)',
            },
          }}
          className="h-64 w-full"
        >
          <AreaChart data={pnlData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(132 63% 47%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(132 63% 47%)" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 83% 53%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0 83% 53%)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 15%)" />
            <XAxis
              dataKey="date"
              stroke="hsl(240 3% 68%)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'hsl(240 3% 68%)' }}
            />
            <YAxis
              stroke="hsl(240 3% 68%)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'hsl(240 3% 68%)' }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="rounded border border-border bg-card p-2 shadow-lg">
                      {payload.map((entry, index) => (
                        <div
                          key={index}
                          className="font-mono text-xs"
                          style={{ color: entry.color }}
                        >
                          {entry.name}: ${entry.value?.toLocaleString()}
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
              stroke="hsl(132 63% 47%)"
              fillOpacity={1}
              fill="url(#colorPnl)"
              name="PnL"
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="hsl(0 83% 53%)"
              fillOpacity={1}
              fill="url(#colorDrawdown)"
              name="Drawdown"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Risk Management Card - 1/3 width */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Risk & Averages
        </h3>
        <div className="space-y-3">
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Largest Gain</div>
            <div className="font-mono text-sm font-bold text-primary">+$2,845.50</div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Largest Loss</div>
            <div className="font-mono text-sm font-bold text-secondary">-$1,234.20</div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Avg Win Amount</div>
            <div className="font-mono text-sm font-bold text-foreground">+$523.45</div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Avg Loss Amount</div>
            <div className="font-mono text-sm font-bold text-foreground">-$245.80</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Trade Duration</div>
            <div className="font-mono text-sm font-bold text-foreground">4h 32m</div>
          </div>
        </div>
      </div>
    </div>
  )
}
