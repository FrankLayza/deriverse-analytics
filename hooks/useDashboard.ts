import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrades, triggerSync } from "@/lib/api/trade";
import { useMemo, useEffect, useRef } from "react";
import {
  enrichTradesWithPnL,
  calculateCoreMetrics,
  calculateLongShortRatio,
  generatePnLTimeSeries,
  calculateDrawdown,
  calculateRiskMetrics,
  calculateFeeComposition,
  calculateSessionPerformance,
  formatTradesForJournal,
} from "@/lib/calculations";

export function useDashboard(wallet: string) {
  const queryClient = useQueryClient();
  const hasTriggeredSync = useRef(false);

  // 1. READ (The Query)
  const {
    data: rawTrades = [],
    isLoading: isReading,
    error: readError,
    refetch,
  } = useQuery({
    queryKey: ["trades", wallet],
    queryFn: () => getTrades(wallet),
    enabled: !!wallet, // Only run if wallet is connected
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  // 2. WRITE (The Sync Mutation)
  const {
    mutate: sync,
    isPending: isSyncing,
    error: syncError,
  } = useMutation({
    mutationFn: () => triggerSync(wallet),
    onSuccess: (data) => {
      console.log(`✅ Synced ${data.inserted} trades`);
      queryClient.invalidateQueries({ queryKey: ["trades", wallet] });
    },
  });

  // 3. AUTO-SYNC on wallet connection
  useEffect(() => {
    if (wallet && !hasTriggeredSync.current) {
      console.log("🚀 Wallet connected - triggering automatic sync...");
      hasTriggeredSync.current = true;
      sync();
    }
  }, [wallet, sync]);

  // 4. TRANSFORM (The Calculations)
  // We use useMemo to prevent recalculating charts on every render
  const dashboardData = useMemo(() => {
    if (!rawTrades || rawTrades.length === 0) return null;

    // A. Apply PnL Logic (FIFO/Average Cost)
    const enrichedTrades = enrichTradesWithPnL(rawTrades);

    // B. Generate all metrics using your calculations.ts library
    return {
      trades: formatTradesForJournal(enrichedTrades),
      coreMetrics: calculateCoreMetrics(enrichedTrades),
      longShortRatio: calculateLongShortRatio(enrichedTrades),
      pnlTimeSeries: generatePnLTimeSeries(enrichedTrades),
      drawdown: calculateDrawdown(enrichedTrades),
      riskMetrics: calculateRiskMetrics(enrichedTrades),
      feeComposition: calculateFeeComposition(enrichedTrades),
      sessionPerformance: calculateSessionPerformance(enrichedTrades),
    };
  }, [rawTrades]);

  return {
    data: dashboardData,
    loading: isReading,
    isSyncing: isSyncing,
    error: readError || syncError,
    sync: () => sync(), // Trigger a full sync (fetch from chain + insert)
    refetch: () => refetch(), // Optional: manual re-fetch (read from DB only)
  };
}
