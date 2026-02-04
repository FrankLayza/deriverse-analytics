import { Connection } from '@solana/web3.js';

// Shared Solana connection for server-side utilities.
// You can swap this to a provider like Helius/QuickNode via env.
const RPC_URL =
  process.env.NEXT_PUBLIC_DERIVERSE_ENDPOINT || 'https://api.devnet.solana.com';

export const connection = new Connection(RPC_URL, 'confirmed');

