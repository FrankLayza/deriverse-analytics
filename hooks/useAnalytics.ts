/**
 * useAnalytics Hook
 * Fetches and manages analytics data from the API
 */

'use client';

import { useState, useEffect } from 'react';
import type {
  CoreMetrics,
  LongShortMetrics,
  RiskMetrics,
  PnLTimeSeriesPoint,
  DrawdownData,
  FeeComposition,
  SessionPerformance,
  TimeBasedMetrics,
  TradeJournalEntry,
} from '@/lib/calculations';

export interface AnalyticsData {
  coreMetrics: CoreMetrics;
  longShortRatio: LongShortMetrics;
  riskMetrics: RiskMetrics;
  pnlTimeSeries: PnLTimeSeriesPoint[];
  drawdown: DrawdownData;
  feeComposition: FeeComposition;
  sessionPerformance: SessionPerformance;
  timeBasedMetrics: TimeBasedMetrics;
  trades: TradeJournalEntry[];
}

export interface AnalyticsFilters {
  symbol?: string;
  startDate?: string;
  endDate?: string;
}

export function useAnalytics(userId: string, filters?: AnalyticsFilters) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query params
        const params = new URLSearchParams({ userId });
        if (filters?.symbol) params.append('symbol', filters.symbol);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await fetch(`/api/analytics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Analytics error:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, filters?.symbol, filters?.startDate, filters?.endDate]);

  const refetch = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId });
      if (filters?.symbol) params.append('symbol', filters.symbol);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
