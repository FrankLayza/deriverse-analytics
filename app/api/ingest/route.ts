import { NextResponse } from "next/server";
import { rpc, deriverseEngine } from "@/lib/deriverse";
import { supabase } from "@/utils/supabase";
import { mapEventToSchema } from "@/lib/deriverse-mapper";

export async function POST(req: Request) {
  try {
    const { signature, wallet } = await req.json();

    // 1. Fetch Transaction
    const txResponse = await (rpc as any).getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    }).send();

    const tx = txResponse?.value || txResponse;
    if (!tx?.meta?.logMessages) return NextResponse.json({ error: "No logs" }, { status: 404 });

    const logMessages = tx.meta.logMessages;
    let decodedEvents: any[] = [];

    // 2. Robust Decoding (Individual fallback strategy)
    try {
      // Try bulk first
      const bulk = await (deriverseEngine as any).logsDecode(logMessages);
      if (bulk?.length) decodedEvents = bulk;
    } catch (e) {
      // Fallback: This is what worked in your local test!
      for (const log of logMessages) {
        if (log.includes("Program data:")) {
          try {
            const single = await (deriverseEngine as any).logsDecode([log]);
            if (single?.length) decodedEvents.push(...single);
          } catch (err) { /* ignore non-event logs */ }
        }
      }
    }

    // 3. Filter and Map
    const fills = decodedEvents.filter(e => e.tag === 11 || e.tag === 19);
    if (fills.length === 0) return NextResponse.json({ ok: true, message: "No fills" });

    const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000) : new Date();
    const rows = fills.map(event => mapEventToSchema(event, signature, wallet, blockTime));

    // 4. Save to DB
    const { error } = await supabase.from("trades").upsert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true, count: rows.length });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}