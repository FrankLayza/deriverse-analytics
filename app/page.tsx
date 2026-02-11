import { TopNav } from '@/components/dashboard/top-nav'
import { HeroMetrics } from '@/components/dashboard/hero-metrics'
import { PerformanceCharts } from '@/components/dashboard/performance-charts'
import { TradeJournal } from '@/components/dashboard/trade-journal'
import { BreakdownCharts } from '@/components/dashboard/breakdown-charts'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import StatsSkeleton from '@/components/StatsSkeleton'
import EmptyState from '@/components/EmptyState'
export default function Home() {
  const {connected, publicKey} = useWallet()

  const [filters, setFilters] = useState({symbol: 'all', startDate: '', endDate: ''})
  const walletAddress = publicKey.toString() || ''
  const {data, loading, error, refetch} = useAnalytics(walletAddress, filters)

  if(!connected || !publicKey){
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Connect your Wallet</h1>
            <p className="text-muted-foreground">Log in to view your Deriverse analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  if(!loading || !data){
    return (
      <div className="min-h-screen bg-background space-y-8 p-8">
        <TopNav />
        <StatsSkeleton />
      </div>
    );
  }

  if(data.trades.length == 0){
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="p-8"><EmptyState /></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <TopNav onRefresh={refetch} isSyncing={loading} />
      <HeroMetrics
        core={data.coreMetrics}
        longShort={data.longShortRatio}
      />
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
        session={data.sessionPerformance}
      />
    </div>
  )
}
