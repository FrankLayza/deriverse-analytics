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
    setError(null)
   try {
      // -------------------------------------------------------------
      // STEP 1: Trigger the Ingestion (Solana -> Supabase)
      // -------------------------------------------------------------
      console.log('Starting ingestion sync...');
      const ingestResponse = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet: userId }),
      });

      if (!ingestResponse.ok) {
        const errorData = await ingestResponse.json();
        console.warn('Ingestion skipped or failed:', errorData);
        // We don't throw an error here because we still want to try 
        // and show them their existing data even if the RPC fails.
      } else {
        const ingestData = await ingestResponse.json();
        console.log(`Ingest complete! Inserted ${ingestData.inserted} new trades.`);
      }

      // -------------------------------------------------------------
      // STEP 2: Fetch the Updated Analytics (Supabase -> Frontend)
      // -------------------------------------------------------------
      const params = new URLSearchParams({ userId });
      if (filters?.symbol) params.append('symbol', filters.symbol);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to refetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData); // Updates the UI instantly!

    } catch (err) {
      console.error('Refetch error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false); // Turns off the spinner
    }
  };

  return { data, loading, error, refetch };
}
