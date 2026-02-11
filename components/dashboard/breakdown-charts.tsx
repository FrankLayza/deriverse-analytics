'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { FeeComposition, SessionPerformance } from '@/lib/calculations'

interface BreakdownChartsProps {
  fees: FeeComposition;
  sessions: SessionPerformance;
}

export function BreakdownCharts({ fees, sessions }: BreakdownChartsProps) {
  // Transform the real fee data into the format Recharts expects
  const dynamicFeeData = [
    { name: 'Spot Fees', value: fees.spotFees, color: 'hsl(var(--primary))' },
    { name: 'Perp Fees', value: fees.perpFees, color: 'hsl(var(--secondary))' },
  ].filter(item => item.value > 0); // Don't render slices for 0 value

  // Transform the real session data. Instead of hardcoded cities, we show Win/Loss sessions
  const dynamicSessionData = [
    { name: 'Profitable Days', value: sessions.profitableSessions, color: 'hsl(var(--primary))' },
    { name: 'Losing Days', value: sessions.losingSessionsCount, color: 'hsl(var(--secondary))' },
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-6">
      {/* Fee Composition */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Fee Composition Breakdown
        </h3>
        
        {dynamicFeeData.length > 0 ? (
          <ChartContainer config={{}} className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicFeeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dynamicFeeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="rounded border border-border bg-card p-2 shadow-lg">
                          <div className="font-mono text-xs flex justify-between gap-4">
                            <span className="text-muted-foreground">{payload[0].name}:</span>
                            <span className="text-foreground font-bold">
                              ${Number(payload[0].value).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
            No fee data available
          </div>
        )}
      </div>

      {/* Session Performance */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Daily Session Profitability
        </h3>
        
        {dynamicSessionData.length > 0 ? (
          <ChartContainer config={{}} className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicSessionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dynamicSessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="rounded border border-border bg-card p-2 shadow-lg">
                          <div className="font-mono text-xs flex justify-between gap-4">
                            <span className="text-muted-foreground">{payload[0].name}:</span>
                            <span className="text-foreground font-bold">
                              {payload[0].value} Days
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
            No session data available
          </div>
        )}
      </div>
    </div>
  )
}