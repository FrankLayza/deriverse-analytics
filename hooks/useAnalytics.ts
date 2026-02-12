/**
 * useAnalytics Hook - WITH AUTO-SYNC
 * Automatically fetches new trades and updates analytics
 */

'use client';

import { useState, useEffect, useRef } from 'react';
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

export function useAnalytics(
  userId: string, 
  filters?: AnalyticsFilters,
  options?: {
    autoSync?: boolean;        // Enable auto-sync
    syncInterval?: number;     // Sync interval in milliseconds (default: 30s)
    syncOnMount?: boolean;     // Sync immediately on mount (default: true)
  }
) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Options with defaults
  const autoSync = options?.autoSync ?? false;
  const syncInterval = options?.syncInterval ?? 30000; // 30 seconds
  const syncOnMount = options?.syncOnMount ?? true;

  /**
   * Fetch analytics data from API
   */
  const fetchAnalytics = async () => {
    if (!userId) return;

    try {
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
      setError(null);
    } catch (err) {
      console.error('Analytics error:', err);
      setError((err as Error).message);
    }
  };

  /**
   * Sync trades from blockchain + fetch analytics
   */
  const syncAndFetch = async (showLoading: boolean = true) => {
    if (!userId) return;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting sync...');

      // Step 1: Ingest new trades from blockchain
      const ingestResponse = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: userId }),
      });

      if (!ingestResponse.ok) {
        const errorData = await ingestResponse.json();
        console.warn('Ingestion skipped or failed:', errorData);
      } else {
        const ingestData = await ingestResponse.json();
        console.log(`✅ Synced ${ingestData.inserted} new trades`);
      }

      // Step 2: Fetch updated analytics
      await fetchAnalytics();
      
      setLastSyncTime(new Date());
      console.log('✅ Sync complete!');

    } catch (err) {
      console.error('Sync error:', err);
      setError((err as Error).message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  /**
   * Manual refetch (for Sync button)
   */
  const refetch = async () => {
    await syncAndFetch(true); // Show loading spinner
  };

  // Initial load
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const initialize = async () => {
      if (syncOnMount) {
        // Sync on mount
        await syncAndFetch(true);
      } else {
        // Just fetch existing data
        setLoading(true);
        await fetchAnalytics();
        setLoading(false);
      }
    };

    initialize();
  }, [userId, filters?.symbol, filters?.startDate, filters?.endDate]);

  // Auto-sync interval
  useEffect(() => {
    if (!userId || !autoSync) return;

    console.log(`🔄 Auto-sync enabled: every ${syncInterval / 1000}s`);

    // Set up interval for auto-sync
    intervalRef.current = setInterval(() => {
      console.log('⏰ Auto-sync triggered');
      syncAndFetch(false); 
    }, syncInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🛑 Auto-sync stopped');
      }
    };
  }, [userId, autoSync, syncInterval]);

  return { 
    data, 
    loading, 
    error, 
    refetch,
    lastSyncTime,
    isAutoSyncing: autoSync,
  };
}