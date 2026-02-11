'use client'

import { useState } from 'react'
import { Edit2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TradeJournalEntry } from '@/lib/calculations'

interface TradeJournalProps {
  trades: TradeJournalEntry[];
}

export function TradeJournal({ trades }: TradeJournalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Increased from 5 to 10 for better data density

  const totalPages = Math.ceil(trades.length / itemsPerPage)
  const paginatedTrades = trades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Edge case: If there are no trades, don't break the pagination math
  if (trades.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="rounded-lg border border-border bg-card p-4 text-center text-muted-foreground">
          No trades found for this period.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="rounded-lg border border-border bg-card p-4 overflow-hidden">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Recent Trade Executions
        </h3>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date/Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Side
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Size
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  PnL
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fees
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {trade.formattedDate}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                    {trade.symbol}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${
                        trade.side === 'buy'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {trade.side === 'buy' ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {trade.order_type || 'MARKET'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-foreground">
                    {trade.formattedQuantity}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-foreground">
                    {trade.formattedPrice}
                  </td>
                  <td
                    className={`px-4 py-3 font-mono text-xs font-bold text-right ${
                      trade.pnLClass === 'profit' 
                        ? 'text-primary' 
                        : trade.pnLClass === 'loss' ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {trade.formattedPnL}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-muted-foreground">
                    {trade.formattedFees}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, trades.length)} of {trades.length} trades
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 bg-transparent"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Generate page numbers dynamically (max 5 visible to avoid overflow) */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to keep current page centered if many pages exist
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      pageNum === currentPage
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 bg-transparent"
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