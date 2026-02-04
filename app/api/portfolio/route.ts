import { NextResponse } from 'next/server';

// GET /api/portfolio/[address]
// Placeholder handler – compute portfolio snapshot for a wallet.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  return NextResponse.json({
    address,
    portfolio: null,
  });
}

