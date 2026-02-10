'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, LogOut, RefreshCw, BarChart3, TrendingUp, History } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import "@solana/wallet-adapter-react-ui/styles.css";

// Components & Utils
import StatsCards from '@/components/dashboard/StatsCards';
import PnLChart from '@/components/dashboard/PnLChart';
import TradeTable from '@/components/dashboard/TradeTable';
import StatsSkeleton from '@/components/dashboard/StatsSkeleton';
import { supabase } from '@/utils/supabase';

function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export default function Home() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [loading, setLoading] = useState(false);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  // Main Data Fetcher
  const refreshDashboard = async (address: string) => {
    setLoading(true);
    try {
      // 1. Sync latest trades from Solana to Database
      await fetch('/api/ingest', {
        method: 'POST',
        body: JSON.stringify({ wallet: address, signature: 'latest' }) // Example trigger
      });

      // 2. Fetch Aggregates & History
      const [aggRes, tradeRes] = await Promise.all([
        supabase.from("daily_aggregates").select("*").eq("user_address", address).order("date", { ascending: true }),
        supabase.from("trades").select("*").eq("user_address", address).order("block_time", { ascending: false }).limit(20)
      ]);

      setAggregates(aggRes.data || []);
      setTrades(tradeRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) refreshDashboard(publicKey.toString());
  }, [connected, publicKey]);

  // --- VIEW: DISCONNECTED ---
  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
        <div className="text-center space-y-4 max-w-md animate-in fade-in zoom-in duration-500">
          <div className="inline-flex p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4">
            <TrendingUp className="w-12 h-12 text-indigo-500" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tighter">DERIVERSE<span className="text-indigo-500">.</span>SCAN</h1>
          <p className="text-zinc-400 text-lg">The professional analytics suite for Deriverse traders. Connect your wallet to begin.</p>
          <button
            onClick={() => setVisible(true)}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-xl shadow-indigo-500/20 font-bold text-lg group"
          >
            <Wallet className="group-hover:rotate-12 transition-transform" />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: CONNECTED DASHBOARD ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Navigation */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black">D</div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">DERIVERSE.SCAN</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-zinc-300">{shortenAddress(publicKey.toString())}</span>
            </div>
            <button onClick={() => disconnect()} className="p-2 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trader Performance</h2>
            <p className="text-zinc-500 mt-1">Analyzing on-chain metrics for {shortenAddress(publicKey.toString())}</p>
          </div>
          <button 
            onClick={() => refreshDashboard(publicKey.toString())}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Sync Logs"}
          </button>
        </section>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StatsCards aggregates={aggregates} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-indigo-500 w-5 h-5" />
                    <h3 className="text-lg font-semibold">Cumulative PnL</h3>
                  </div>
                </div>
                <PnLChart data={aggregates} />
              </div>

              {/* Side Journal */}
              <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-sm h-fit">
                <div className="flex items-center gap-2 mb-8">
                  <History className="text-indigo-500 w-5 h-5" />
                  <h3 className="text-lg font-semibold">Recent Fills</h3>
                </div>
                <TradeTable trades={trades} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}