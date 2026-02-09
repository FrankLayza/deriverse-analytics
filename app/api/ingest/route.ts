import { NextResponse } from 'next/server'
import { LogType } from '@deriverse/kit'
import { getDeriverse } from '@/lib/deriverse-engine'
import { supabase } from '@/utils/supabase'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { signature, wallet } = await req.json()

    if (!signature || !wallet) {
      return NextResponse.json({ error: 'Missing signature or wallet' }, { status: 400 })
    }

    const { engine, rpc } = await getDeriverse()

    console.log('[Ingest] Fetching tx:', signature)

    const tx = await rpc.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      encoding: 'jsonParsed',
    }).send()

    if (!tx?.meta?.logMessages) {
      return NextResponse.json({ error: 'No logs found in transaction' }, { status: 400 })
    }

    const decoded = engine.logsDecode(tx.meta.logMessages)
    console.log('[Ingest] Decoded events:', decoded)

    const fills = decoded.filter(
      (e: any) =>
        e.tag === LogType.spotFillOrder ||
        e.tag === LogType.perpFillOrder
    )

    console.log('[Ingest] Trade fills:', fills)

    if (fills.length === 0) {
      return NextResponse.json({ ok: true, message: 'No fills found' })
    }

    const rows = fills.map((f: any) => ({
      wallet,
      instr_id: f.instrId ?? null,
      market_type: f.tag === LogType.spotFillOrder ? 'spot' : 'perp',
      side: f.side === 0 ? 'buy' : 'sell',
      price: f.price,
      qty: f.qty ?? f.perps,
      value: f.crncy,
      tx_signature: signature
    }))

    const { error } = await supabase.from('trades').insert(rows)

    if (error) {
      console.error('[Supabase Insert Error]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Ingest] Stored trades:', rows)

    return NextResponse.json({
      ok: true,
      inserted: rows.length,
      trades: rows
    })
  } catch (err: any) {
    console.error('[Ingest Error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}