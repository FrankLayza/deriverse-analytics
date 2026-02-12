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
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { MotionContainer } from "@/components/motion-container";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [sessionExpired, setSessionExpired] = useState(false);
  useWalletTimeout(10 * 60 * 1000, () => setSessionExpired(true));

  const [filters, setFilters] = useState({
    symbol: "all",
    startDate: "",
    endDate: "",
  });
  const walletAddress = publicKey?.toString() || "";
  const { data, loading, error, refetch, lastSyncTime, isAutoSyncing } =
    useAnalytics(walletAddress, filters, {
      autoSync: true,
      syncInterval: 5 * 30000,
      syncOnMount: true,
    });

  if (!connected && sessionExpired) {
    return (
      <div className="relative min-h-screen bg-background">
        {/* BLURRED BACKGROUND CONTENT */}
        <div className="blur-md pointer-events-none opacity-50 select-none h-screen overflow-hidden">
          <TopNav onRefresh={() => {}} isSyncing={false} />
          {/* We render the skeleton here to simulate the dashboard layout in the background */}
          <div className="p-8">
            <StatsSkeleton />
          </div>
        </div>

        {/* THE OVERLAY MODAL */}
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 mx-4 text-center rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Session Expired
            </h2>
            <p className="text-muted-foreground mb-8">
              For your security, we disconnected your wallet after 10 minutes of
              inactivity.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                className="cursor-pointer py-4"
                variant="outline"
                onClick={() => {
                  setSessionExpired(false); // Go back to main login screen
                }}
              >
                Cancel
              </Button>
              <Button
                className=" cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setSessionExpired(false); // Reset state
                  setVisible(true); // Open Wallet Adapter Modal
                }}
              >
                Reconnect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              className="cursor-pointer mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold"
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
      <div className="min-h-screen bg-background space-y-8">
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
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="relative z-10">
        <TopNav onRefresh={refetch} isSyncing={loading} />
        <MotionContainer>
          <HeroMetrics
            core={data.coreMetrics}
            longShort={data.longShortRatio}
          />
        </MotionContainer>
        <div className="border-t border-border" />

        <MotionContainer delay={0.3}>
          <PerformanceCharts
            pnlSeries={data.pnlTimeSeries}
            drawdown={data.drawdown}
            risk={data.riskMetrics}
          />
        </MotionContainer>

        <div className="border-t border-border" />

        <MotionContainer delay={0.4}>
          <TradeJournal trades={data.trades} />
        </MotionContainer>
        <div className="border-t border-border" />

        <MotionContainer delay={0.5}>
          <BreakdownCharts
            fees={data.feeComposition}
            sessions={data.sessionPerformance}
          />
        </MotionContainer>
      </div>
    </div>
  );
}
