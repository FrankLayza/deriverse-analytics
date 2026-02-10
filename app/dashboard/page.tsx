import { Suspense } from "react";
import { supabase } from "@/utils/supabase";
import StatsCards from "@/components/dashboard/StatsCards";
import PnLChart from "@/components/dashboard/PnLChart";
import TradeTable from "@/components/dashboard/TradeTable";

export default async function AnalyticsDashboard({
  searchParams,
}: {
  searchParams: { wallet?: string };
}) {
  const wallet = await searchParams.wallet || "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";

  // 1. Fetch Aggregates for Charts
  const { data: aggregates } = await supabase
    .from("daily_aggregates")
    .select("*")
    .eq("user_address", wallet)
    .order("date", { ascending: true });

  // 2. Fetch Recent Trades for the Journal
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_address", wallet)
    .order("block_time", { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Analytics</h1>
          <p className="text-muted-foreground">Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}</p>
        </div>
      </header>

      <Suspense fallback={<div>Loading Stats...</div>}>
        <StatsCards aggregates={aggregates || []} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">PnL Performance (USD)</h3>
          <PnLChart data={aggregates || []} />
        </div>
        <div className="col-span-3 bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Trade Journal</h3>
          <TradeTable trades={trades || []} />
        </div>
      </div>
    </div>
  );
}