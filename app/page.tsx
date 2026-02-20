"use client";
import { TopNav } from "@/components/dashboard/top-nav";
import { HeroMetrics } from "@/components/dashboard/hero-metrics";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { TradeJournal } from "@/components/dashboard/trade-journal";
import { BreakdownCharts } from "@/components/dashboard/breakdown-charts";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import StatsSkeleton from "@/components/StatsSkeleton";
import EmptyState from "@/components/EmptyState";
import { useWalletTimeout } from "@/hooks/useWalletTimeout";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { MotionContainer } from "@/components/motion-container";
import { ErrorBoundary } from "@/components/error-boundary";

/**
 * Convert technical error messages to user-friendly messages
 */
function getFriendlyErrorMessage(error: unknown): string {
  const message = (error as Error)?.message || String(error);

  // Handle specific error types
  if (message.includes("Too many sync requests")) {
    return message; // Already user-friendly from API
  }
  if (message.includes("Failed to fetch trades")) {
    return "Could not fetch your trade history. Please check your internet connection and try again.";
  }
  if (message.includes("wallet")) {
    return "Wallet connection error. Please reconnect your wallet and try again.";
  }
  if (message.includes("Network")) {
    return "Network error. Please check your connection and try again.";
  }
  if (message.includes("Invalid")) {
    return "Invalid data received. Please try syncing again.";
  }

  // Fallback for unknown errors
  return "An unexpected error occurred while loading your analytics. Please try again.";
}

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [sessionExpired, setSessionExpired] = useState(false);

  useWalletTimeout(10 * 60 * 1000, () => setSessionExpired(true));

  const walletAddress = publicKey?.toString() || "";
  const { data, loading, error, sync, isSyncing } = useDashboard(walletAddress);

  if (!connected && sessionExpired) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="blur-md pointer-events-none opacity-50 select-none h-screen overflow-hidden">
          <TopNav onRefresh={() => {}} isSyncing={false} />
          <div className="p-8">
            <StatsSkeleton />
          </div>
        </div>
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
                onClick={() => setSessionExpired(false)}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setSessionExpired(false);
                  setVisible(true);
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
        <TopNav onRefresh={() => {}} isSyncing={false} />
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
        <TopNav onRefresh={sync} isSyncing={isSyncing} />
        <main className="max-w-7xl mx-auto px-6 mt-8">
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl">
            <div className="flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 text-destructive">
                  Error Loading Analytics
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getFriendlyErrorMessage(error)}
                </p>
                <Button
                  onClick={sync}
                  disabled={isSyncing}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isSyncing ? "Retrying..." : "Try Again"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading || (!data && !error)) {
    return (
      <div className="min-h-screen bg-background space-y-8">
        <TopNav onRefresh={sync} isSyncing={isSyncing} />
        <StatsSkeleton />
      </div>
    );
  }

  if (!data?.trades || data.trades.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav onRefresh={sync} isSyncing={isSyncing} />
        <div className="p-8">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <TopNav onRefresh={sync} isSyncing={isSyncing} />

        <MotionContainer>
          <HeroMetrics
            core={data.coreMetrics}
            longShort={data.longShortRatio}
          />
        </MotionContainer>
        <div className="border-t border-border" />

        <ErrorBoundary>
          <MotionContainer delay={0.3}>
            <PerformanceCharts
              pnlSeries={data.pnlTimeSeries}
              drawdown={data.drawdown}
              risk={data.riskMetrics}
            />
          </MotionContainer>
        </ErrorBoundary>
        <div className="border-t border-border" />

        <ErrorBoundary>
          <MotionContainer delay={0.4}>
            <TradeJournal trades={data.trades} />
          </MotionContainer>
        </ErrorBoundary>
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
