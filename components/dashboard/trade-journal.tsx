'use client'

import { useState } from 'react'
import { Filter, Download, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TradeJournalEntry } from '@/lib/calculations'

interface TradeJournalProps {
  trades: TradeJournalEntry[];
}

// Deterministic color palette for asset badges based on first letter
const BADGE_COLORS: Record<string, string> = {
  S: 'bg-blue-600',
  B: 'bg-orange-500',
  E: 'bg-purple-600',
  A: 'bg-emerald-500',
  D: 'bg-pink-500',
  L: 'bg-cyan-500',
  M: 'bg-amber-500',
  R: 'bg-rose-500',
  T: 'bg-teal-500',
  W: 'bg-indigo-500',
}

function getAssetBadgeColor(symbol: string): string {
  const firstChar = symbol.charAt(0).toUpperCase()
  return BADGE_COLORS[firstChar] || 'bg-slate-500'
}

function getBaseAsset(symbol: string): string {
  // Handles formats: "SOL/USD", "SOL-PERP", "Inst #5", etc.
  const slash = symbol.indexOf('/')
  if (slash > 0) return symbol.substring(0, slash)
  const dash = symbol.indexOf('-')
  if (dash > 0) return symbol.substring(0, dash)
  return symbol
}

export function TradeJournal({ trades }: TradeJournalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(trades.length / itemsPerPage)
  const paginatedTrades = trades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  if (trades.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No trades found for this period.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 className="text-base font-bold text-foreground">
            Trade Journal
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Side
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  PnL
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Market Type
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade) => {
                const baseAsset = getBaseAsset(trade.symbol)
                const badgeChar = baseAsset.charAt(0).toUpperCase()
                const badgeColor = getAssetBadgeColor(trade.symbol)

                return (
                  <tr
                    key={trade.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    {/* TIME */}
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {trade.formattedDate}
                    </td>

                    {/* ASSET */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-foreground">
                        {trade.symbol}
                      </span>
                    </td>

                    {/* SIDE */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          trade.side === 'buy'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {trade.side === 'buy' ? 'BUY' : 'SELL'}
                      </span>
                    </td>

                    {/* SIZE */}
                    <td className="px-4 py-4 font-mono text-xs text-foreground whitespace-nowrap">
                      {trade.formattedQuantity}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-4 font-mono text-xs text-foreground">
                      {trade.formattedPrice}
                    </td>

                    {/* PNL */}
                    <td
                      className={`px-4 py-4 font-mono text-xs font-bold ${
                        trade.pnLClass === 'profit'
                          ? 'text-emerald-400'
                          : trade.pnLClass === 'loss' ? 'text-red-400' : 'text-muted-foreground'
                      }`}
                    >
                      {trade.formattedPnL}
                    </td>

                    {/* MARKET TYPE */}
                    <td className="px-4 py-4 text-right text-xs text-muted-foreground">
                      {trade.market_type || 'unknown'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-xs text-teal-400/80">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, trades.length)} of {trades.length} trades
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>

            {/* Page numbers (max 5 visible) */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }

              return (
                <button
                  key={pageNum}
                  className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                    pageNum === currentPage
                      ? 'bg-purple-600 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}