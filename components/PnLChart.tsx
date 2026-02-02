'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TimeSeriesData } from '@/types';
import { formatCurrency } from '@/lib/analytics';

interface PnLChartProps {
  data: TimeSeriesData[];
}

export default function PnLChart({ data }: PnLChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Cumulative PnL Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
            stroke="#9ca3af"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#9ca3af"
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="cumulativePnl" 
            stroke="#8b5cf6" 
            fillOpacity={1}
            fill="url(#colorPnl)"
            name="Cumulative PnL"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
