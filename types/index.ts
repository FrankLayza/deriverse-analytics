// Shared TypeScript interfaces will live here.
// Example placeholder for a Trade type – adapt as needed.
export interface Trade {
  id: string;
  timestamp: number;
  market: string;
  side: 'long' | 'short';
  size: number;
  price: number;
  pnl?: number;
}

