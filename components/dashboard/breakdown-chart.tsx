'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

const feeData = [
  { name: 'Spot Fees', value: 650, color: 'hsl(132 63% 47%)' },
  { name: 'Perp Fees', value: 595, color: 'hsl(190 85% 49%)' },
]

const performanceByTime = [
  { name: 'Asia', value: 4250, color: 'hsl(132 63% 47%)' },
  { name: 'London', value: 3840, color: 'hsl(190 85% 49%)' },
  { name: 'NY', value: 4757, color: 'hsl(280 65% 60%)' },
]

export function BreakdownCharts() {
  return (
    <div className="grid grid-cols-2 gap-4 px-6 py-6">
      {/* Fee Composition */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Fee Composition
        </h3>
        <ChartContainer config={{}} className="h-56 w-full">
          <PieChart>
            <Pie
              data={feeData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {feeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="rounded border border-border bg-card p-2 shadow-lg">
                      <div className="font-mono text-xs text-foreground">
                        {payload[0].name}: ${payload[0].value}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '16px',
              }}
              formatter={(value, entry) => (
                <span className="text-xs text-muted-foreground">{entry.payload.name || 'jack'}</span>
              )}
            />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Time of Day Performance */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Session Performance
        </h3>
        <ChartContainer config={{}} className="h-56 w-full">
          <PieChart>
            <Pie
              data={performanceByTime}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {performanceByTime.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="rounded border border-border bg-card p-2 shadow-lg">
                      <div className="font-mono text-xs text-foreground">
                        {payload[0].name}: ${payload[0].value.toLocaleString()}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '16px',
              }}
              formatter={(value, entry) => (
                <span className="text-xs text-muted-foreground">{entry.payload.name || 'Jack'}</span>
              )}
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  )
}
