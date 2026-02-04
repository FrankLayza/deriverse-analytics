import { NextResponse } from 'next/server';

// GET /api/trades/[address]
// Placeholder handler – fetch stored trades for a wallet address.
export async function GET(
  _request: Request,
  context: { params: { address: string } }
) {
  const { address } = context.params;
  return NextResponse.json({ address, trades: [] });
}

