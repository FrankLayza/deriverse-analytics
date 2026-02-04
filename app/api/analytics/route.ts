import { NextResponse } from 'next/server';

// GET /api/analytics/[address]?range=...
// Placeholder handler – compute analytics over a time range.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const range = searchParams.get('range') ?? '30d';

  return NextResponse.json({
    address,
    range,
    analytics: null,
  });
}

