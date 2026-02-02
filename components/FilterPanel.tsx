'use client';

import React from 'react';

interface FilterPanelProps {
  symbols: string[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export default function FilterPanel({
  symbols,
  selectedSymbol,
  onSymbolChange,
  startDate,
  endDate,
  onDateChange,
}: FilterPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Symbol</label>
          <select
            value={selectedSymbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            <option value="all">All Symbols</option>
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );
}
