'use client';

import React, { useState } from 'react';
import { Trade } from '@/types';
import { formatCurrency, formatDuration } from '@/lib/analytics';

interface TradeTableProps {
  trades: Trade[];
}

export default function TradeTable({ trades }: TradeTableProps) {
  const [sortField, setSortField] = useState<keyof Trade>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedTrades = [...trades].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Trade History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('timestamp')}>
                Date
              </th>
              <th className="text-left p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('symbol')}>
                Symbol
              </th>
              <th className="text-left p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('side')}>
                Side
              </th>
              <th className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('entryPrice')}>
                Entry
              </th>
              <th className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('exitPrice')}>
                Exit
              </th>
              <th className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('size')}>
                Size
              </th>
              <th className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('pnl')}>
                PnL
              </th>
              <th className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => handleSort('fees')}>
                Fees
              </th>
              <th className="text-right p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-2">{new Date(trade.timestamp).toLocaleString()}</td>
                <td className="p-2 font-medium">{trade.symbol}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 text-right">{formatCurrency(trade.entryPrice)}</td>
                <td className="p-2 text-right">{formatCurrency(trade.exitPrice)}</td>
                <td className="p-2 text-right">{trade.size.toFixed(4)}</td>
                <td className={`p-2 text-right font-medium ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(trade.pnl)}
                </td>
                <td className="p-2 text-right text-gray-500">{formatCurrency(trade.fees)}</td>
                <td className="p-2 text-right text-gray-500">{formatDuration(trade.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
