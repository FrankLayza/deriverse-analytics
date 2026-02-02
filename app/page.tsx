'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MetricCard from '@/components/MetricCard';
import PnLChart from '@/components/PnLChart';
import TradeTable from '@/components/TradeTable';
import FilterPanel from '@/components/FilterPanel';
import { Trade } from '@/types';
import { generateMockTrades } from '@/lib/mockData';
import { 
  calculateMetrics, 
  generateTimeSeriesData, 
  formatCurrency, 
  formatPercent,
  formatDuration 
} from '@/lib/analytics';
import { TrendingUp, DollarSign, Activity, Clock, Target, BarChart3 } from 'lucide-react';

export default function Home() {
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // TODO: Replace with actual Solana blockchain data fetching
    const mockTrades = generateMockTrades(100);
    setAllTrades(mockTrades);
    
    // Set default date range
    const dates = mockTrades.map(t => t.timestamp);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    setStartDate(minDate.toISOString().split('T')[0]);
    setEndDate(maxDate.toISOString().split('T')[0]);
  }, []);

  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      const matchesSymbol = selectedSymbol === 'all' || trade.symbol === selectedSymbol;
      const tradeDate = new Date(trade.timestamp);
      const matchesDate = (!startDate || tradeDate >= new Date(startDate)) &&
                         (!endDate || tradeDate <= new Date(endDate));
      return matchesSymbol && matchesDate;
    });
  }, [allTrades, selectedSymbol, startDate, endDate]);

  const metrics = useMemo(() => calculateMetrics(filteredTrades), [filteredTrades]);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(filteredTrades), [filteredTrades]);
  const symbols = useMemo(() => [...new Set(allTrades.map(t => t.symbol))], [allTrades]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Deriverse Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive trading performance dashboard
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel
            symbols={symbols}
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            startDate={startDate}
            endDate={endDate}
            onDateChange={setStartDate}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total PnL"
            value={formatCurrency(metrics.totalPnl)}
            trend={metrics.totalPnl >= 0 ? 'up' : 'down'}
            icon={<TrendingUp size={24} />}
          />
          <MetricCard
            title="Win Rate"
            value={formatPercent(metrics.winRate)}
            subtitle={`${metrics.totalTrades} total trades`}
            icon={<Target size={24} />}
          />
          <MetricCard
            title="Total Volume"
            value={formatCurrency(metrics.totalVolume)}
            subtitle={`${formatCurrency(metrics.totalFees)} in fees`}
            icon={<DollarSign size={24} />}
          />
          <MetricCard
            title="Avg Duration"
            value={formatDuration(metrics.avgTradeDuration)}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Long/Short Ratio"
            value={metrics.longShortRatio.toFixed(2)}
            icon={<BarChart3 size={24} />}
          />
          <MetricCard
            title="Largest Gain"
            value={formatCurrency(metrics.largestGain)}
            trend="up"
            icon={<TrendingUp size={24} />}
          />
          <MetricCard
            title="Largest Loss"
            value={formatCurrency(metrics.largestLoss)}
            trend="down"
            icon={<Activity size={24} />}
          />
          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor.toFixed(2)}
            subtitle={`Avg Win: ${formatCurrency(metrics.avgWin)}`}
            icon={<Target size={24} />}
          />
        </div>

        {/* PnL Chart */}
        <div className="mb-6">
          <PnLChart data={timeSeriesData} />
        </div>

        {/* Trade History */}
        <div>
          <TradeTable trades={filteredTrades} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ This dashboard currently uses mock data for development.</p>
          <p>Connect to Solana blockchain to fetch real Deriverse trading data.</p>
        </div>
      </div>
    </main>
  );
}
