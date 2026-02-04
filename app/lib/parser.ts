import { PublicKey } from '@solana/web3.js';

// Placeholder type – replace with your real Trade type in /types
export interface ParsedTrade {
  id: string;
  timestamp: number;
  market: string;
  side: 'long' | 'short';
  size: number;
  price: number;
}

// Example signature for a parser that turns logs into trades.
export function parseDeriverseLogsToTrades(
  _wallet: PublicKey,
  _logs: string[]
): ParsedTrade[] {
  // TODO: Implement actual Deriverse log parsing here.
  return [];
}

