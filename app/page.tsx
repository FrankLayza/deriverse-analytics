"use client";
import { TopNav } from "@/components/dashboard/top-nav";
import { HeroMetrics } from "@/components/dashboard/hero-metrics";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { TradeJournal } from "@/components/dashboard/trade-journal";
import { BreakdownCharts } from "@/components/dashboard/breakdown-charts";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import StatsSkeleton from "@/components/StatsSkeleton";
import EmptyState from "@/components/EmptyState";
import { useWalletTimeout } from "@/hooks/useWalletTimeout";

export default function Home() {
  const { connected, publicKey } = useWallet();
  useWalletTimeout(10 * 60 * 1000);

  const [filters, setFilters] = useState({
    symbol: "all",
    startDate: "",
    endDate: "",
  });
  const walletAddress = publicKey?.toString() || "";
  const { data, loading, error, refetch } = useAnalytics(
    walletAddress,
    filters,
  );

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav onRefresh={refetch} isSyncing={loading} />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Connect your Wallet</h1>
            <p className="text-muted-foreground">
              Log in to view your Deriverse analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <TopNav onRefresh={refetch} isSyncing={loading} />
        <main className="max-w-7xl mx-auto px-6 mt-8">
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <h3 className="text-lg font-bold mb-2">Error Loading Analytics</h3>
            <p className="font-mono text-sm">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background space-y-8 p-8">
        <TopNav onRefresh={refetch} isSyncing={loading} />
        <StatsSkeleton />
      </div>
    );
  }

  if (!data?.trades || data.trades.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav onRefresh={refetch} isSyncing={loading} />
        <div className="p-8">
          <EmptyState />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <TopNav onRefresh={refetch} isSyncing={loading} />
      <HeroMetrics core={data.coreMetrics} longShort={data.longShortRatio} />
      <div className="border-t border-border" />
      <PerformanceCharts
        pnlSeries={data.pnlTimeSeries}
        drawdown={data.drawdown}
        risk={data.riskMetrics}
      />
      <div className="border-t border-border" />
      <TradeJournal trades={data.trades} />
      <div className="border-t border-border" />
      <BreakdownCharts
        fees={data.feeComposition}
        sessions={data.sessionPerformance}
      />
    </div>
  );
}
