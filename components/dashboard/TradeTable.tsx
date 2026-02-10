"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink, 
  Search 
} from "lucide-react";

interface Trade {
  transaction_signature: string;
  block_time: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  quote_amount: number;
  market_type: string;
}

export default function TradeTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter trades..."
            className="w-full bg-background border rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-left font-medium text-muted-foreground">
              <th className="p-4">Side</th>
              <th className="p-4">Price</th>
              <th className="p-4">Size</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-right">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {trades.map((trade) => (
              <tr key={trade.transaction_signature} className="hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {trade.side === "buy" ? (
                      <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold uppercase">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        Buy
                      </div>
                    ) : (
                      <div className="flex items-center text-rose-500 bg-rose-500/10 px-2 py-1 rounded text-xs font-bold uppercase">
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                        Sell
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 font-mono font-medium">
                  ${Number(trade.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-muted-foreground">
                  {Number(trade.quantity).toFixed(4)}
                </td>
                <td className="p-4 font-medium">
                  ${Number(trade.quote_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-right">
                  <a
                    href={`https://explorer.solana.com/tx/${trade.transaction_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                  No trades found for this wallet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="py-4 text-xs text-muted-foreground text-right">
        Showing last {trades.length} fills
      </div>
    </div>
  );
}