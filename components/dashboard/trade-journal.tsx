'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Trade {
  id: string
  date: string
  symbol: string
  side: 'Buy' | 'Sell'
  orderType: 'Market' | 'Limit'
  size: number
  entryPrice: number
  exitPrice: number
  pnl: number
  fees: number
}

const trades: Trade[] = [
  {
    id: '1',
    date: '2024-02-10 14:32',
    symbol: 'SOL/USDC',
    side: 'Buy',
    orderType: 'Market',
    size: 10.5,
    entryPrice: 98.45,
    exitPrice: 104.20,
    pnl: 601.88,
    fees: 12.50,
  },
  {
    id: '2',
    date: '2024-02-09 09:15',
    symbol: 'BTC/USDC',
    side: 'Sell',
    orderType: 'Limit',
    size: 0.15,
    entryPrice: 42850.00,
    exitPrice: 42650.00,
    pnl: 300.00,
    fees: 25.00,
  },
  {
    id: '3',
    date: '2024-02-08 16:44',
    symbol: 'SOL/USDC',
    side: 'Buy',
    orderType: 'Limit',
    size: 25.0,
    entryPrice: 95.30,
    exitPrice: 92.50,
    pnl: -700.00,
    fees: 35.20,
  },
  {
    id: '4',
    date: '2024-02-07 11:22',
    symbol: 'ETH/USDC',
    side: 'Buy',
    orderType: 'Market',
    size: 2.5,
    entryPrice: 2340.50,
    exitPrice: 2450.75,
    pnl: 275.63,
    fees: 18.75,
  },
  {
    id: '5',
    date: '2024-02-06 13:08',
    symbol: 'BTC/USDC',
    side: 'Buy',
    orderType: 'Market',
    size: 0.08,
    entryPrice: 42500.00,
    exitPrice: 43200.00,
    pnl: 560.00,
    fees: 20.00,
  },
]

export function TradeJournal() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(trades.length / itemsPerPage)
  const paginatedTrades = trades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <div className="px-6 py-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Trade Journal
        </h3>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date/Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Symbol
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
                  Entry Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Exit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  PnL
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fees
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{trade.date}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                    {trade.symbol}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                        trade.side === 'Buy'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary/20 text-secondary'
                      }`}
                    >
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{trade.orderType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-foreground">
                    {trade.size.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-foreground">
                    ${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-foreground">
                    ${trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`px-4 py-3 font-mono text-xs font-bold text-right ${
                      trade.pnl >= 0 ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right text-foreground">
                    ${trade.fees.toFixed(2)}
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
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  page === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
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
