'use client'

import { useState, useMemo } from 'react'
import { Filter, Download, X, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TradeJournalEntry } from '@/lib/calculations'

interface TradeJournalProps {
  trades: TradeJournalEntry[];
}

// Color palette for asset indicators
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

export function TradeJournal({ trades }: TradeJournalProps) {
  // --- STATE ---
  const [showFilters, setShowFilters] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- FILTERING LOGIC ---
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSearch = trade.symbol.toLowerCase().includes(filterQuery.toLowerCase())
      const matchesSide = sideFilter === 'all' || trade.side === sideFilter
      return matchesSearch && matchesSide
    })
  }, [trades, filterQuery, sideFilter])

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleFilterChange = (type: 'search' | 'side', value: string) => {
    if (type === 'search') setFilterQuery(value)
    if (type === 'side') setSideFilter(value as any)
    setCurrentPage(1) // Reset to first page on filter change
  }

  if (trades.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No trades found for this period.
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/50">
          <h3 className="text-base font-bold text-foreground font-sans">Trade Journal</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant={showFilters ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* FILTER MENU */}
        {showFilters && (
          <div className="p-4 bg-muted/20 border-b border-border animate-in slide-in-from-top duration-200">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-64 space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Search Asset</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="e.g. SOL, BTC..."
                    className="w-full bg-background border border-border rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    value={filterQuery}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-48 space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Side</label>
                <div className="flex bg-background border border-border rounded-md p-1">
                  {['all', 'buy', 'sell'].map((side) => (
                    <button
                      key={side}
                      onClick={() => handleFilterChange('side', side)}
                      className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition-all ${
                        sideFilter === side ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>

              {(filterQuery || sideFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {setFilterQuery(''); setSideFilter('all')}}
                  className="text-xs h-9 gap-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" /> Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        {filteredTrades.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground text-sm italic">
            No trades match your current filters.
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: List Cards (Visible < 640px) */}
            <div className="sm:hidden divide-y divide-border/30">
              {paginatedTrades.map((trade) => (
                <div key={trade.id} className="p-4 bg-card hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getAssetBadgeColor(trade.symbol)}`} />
                        <span className="text-sm font-bold text-foreground">{trade.symbol}</span>
                      </div>
                      <span className={`w-fit text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        trade.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold ${
                        trade.pnLClass === 'profit' ? 'text-emerald-400' : trade.pnLClass === 'loss' ? 'text-red-400' : 'text-muted-foreground'
                      }`}>
                        {trade.formattedPnL}
                      </span>
                      <div className="text-[10px] text-muted-foreground italic uppercase mt-0.5">{trade.market_type || 'spot'}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] text-muted-foreground border-t border-border/30 pt-3">
                    <div>
                      <span className="text-white/20 mr-1 uppercase font-semibold">Size</span>
                      <span className="font-mono text-foreground/80">{trade.formattedQuantity}</span>
                    </div>
                    <div>
                      <span className="text-white/20 mr-1 uppercase font-semibold">Price</span>
                      <span className="font-mono text-foreground/80">{trade.formattedPrice}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-3 font-mono">
                    {trade.formattedDate}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Table (Visible >= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Side</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Size</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">PnL</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Market</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paginatedTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{trade.formattedDate}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${getAssetBadgeColor(trade.symbol)}`} />
                          <span className="text-sm font-bold text-foreground">{trade.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          trade.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-foreground/90">{trade.formattedQuantity}</td>
                      <td className="px-4 py-4 font-mono text-xs text-foreground/90">{trade.formattedPrice}</td>
                      <td className={`px-4 py-4 font-mono text-xs font-bold ${
                        trade.pnLClass === 'profit' ? 'text-emerald-400' : trade.pnLClass === 'loss' ? 'text-red-400' : 'text-muted-foreground'
                      }`}>
                        {trade.formattedPnL}
                      </td>
                      <td className="px-4 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase">{trade.market_type || 'spot'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4 border-t border-border/50 bg-muted/5">
          <div className="text-[11px] text-muted-foreground font-medium">
            Showing <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTrades.length)}</span> of <span className="text-foreground">{filteredTrades.length}</span> trades
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline" 
              size="sm" 
              className="h-8 px-2 text-xs gap-1 text-muted-foreground border-border/50 hover:bg-muted"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((pageNum, idx, arr) => (
                  <div key={pageNum} className="flex items-center">
                    {idx > 0 && arr[idx-1] !== pageNum - 1 && <span className="px-1 text-muted-foreground text-xs">...</span>}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-md text-xs font-bold transition-all ${
                        pageNum === currentPage 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </div>
              ))}
            </div>

            <Button
              variant="outline" 
              size="sm" 
              className="h-8 px-2 text-xs gap-1 text-muted-foreground border-border/50 hover:bg-muted"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}