import "dotenv/config";
import { rpc, deriverseEngine, programId } from "./deriverse";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Trade {
  signature: string;
  side: "BUY" | "SELL" | "UNKNOWN";
  marketType: "SPOT" | "PERP" | "UNKNOWN";
  orderType: string;
  ioc: boolean;
  price: number | null;
  sizeRaw: number | null;
  crncy: number | null;
  rebates: number | null;
  instrumentId: number | null;
  pair: string;
  leverage: number | null;
  orderId: number | null;
  clientId: number | null;
  tag: number | null;
  blockTime: Date | null;
  slot: number | null;
  raw: any;
}

const ORDER_TYPES: Record<number, string> = {
  0: "LIMIT",
  1: "MARKET",
  2: "MARGIN_CALL",
  3: "FORCED_CLOSE",
};

// ─── Hardcoded instrument map ────────────────────────────────────────────────
//
// Engine.initialize() fails on devnet RPC (getMultipleAccountsInfo),
// and getProgramAccounts also hangs. So we hardcode known instruments.
//
// How to discover new IDs: run this script, note the instrId from decoded
// spotPlaceOrder (tag 10) events, then identify the pair from the Deriverse UI
// or transaction explorer. Add the mapping here.

const INSTRUMENT_PAIRS: Record<number, string> = {
  1: "SOL/USDT",
  // Add more as you discover them:
  // 2: "BONK/USDT",
  // 3: "JUP/USDT",
};

// ─── Core fetcher ────────────────────────────────────────────────────────────

export async function fetchTrades(
  wallet: string,
  options?: { limit?: number; maxTxToScan?: number },
): Promise<Trade[]> {
  const limit = options?.limit ?? 100;
  const maxTxToScan = options?.maxTxToScan ?? 50;

  console.log(`🔍 Fetching trades for wallet: ${wallet}`);
  console.log(`   Program: ${programId}`);

  // 1. Fetch transaction signatures
  let signaturesResponse: any;
  try {
    signaturesResponse = await (rpc as any)
      .getSignaturesForAddress(wallet as any, { limit })
      .send();
  } catch (err: any) {
    console.error(`❌ Failed to fetch signatures: ${err.message}`);
    return [];
  }

  const signatures = Array.isArray(signaturesResponse)
    ? signaturesResponse
    : signaturesResponse?.value ?? [];

  const successful = signatures.filter((s: any) => s.err === null);
  console.log(`✅ Found ${signatures.length} txs, ${successful.length} successful`);

  if (successful.length === 0) return [];

  // 2. Process transactions
  const trades: Trade[] = [];
  const txCount = Math.min(successful.length, maxTxToScan);

  for (let i = 0; i < txCount; i++) {
    const sigInfo = successful[i];
    const sig = sigInfo.signature;

    try {
      const txResp = await (rpc as any)
        .getTransaction(sig, { maxSupportedTransactionVersion: 0 })
        .send();

      const tx = txResp?.value ?? txResp;
      if (!tx) continue;

      const logMessages: string[] = tx.meta?.logMessages ?? [];
      if (logMessages.length === 0) continue;

      // ── KEY FIX: filter to only "Program data: " lines ──
      //
      // From reading logs-decoder.js source:
      //   Line 18: if (log.startsWith('Program returned error') || ...)
      //   Line 19:     return [];
      //
      // If ANY log line starts with "Program returned error", the
      // decoder aborts and returns []. By filtering to only
      // "Program data: " lines, we bypass this and decode ALL events
      // including spotPlaceOrder (tag 10) which has instrId & orderType.
      const dataLines = logMessages.filter((l: string) => l.startsWith("Program data: "));
      if (dataLines.length === 0) continue;

      let decodedEvents: any[];
      try {
        decodedEvents = (deriverseEngine as any).logsDecode(dataLines);
      } catch {
        continue;
      }

      if (!Array.isArray(decodedEvents) || decodedEvents.length === 0) continue;

      if (i < 3) {
        console.log(`\n🔓 Tx ${sig.slice(0, 16)}… — ${decodedEvents.length} events: [${decodedEvents.map((e: any) => `tag=${e.tag}(${Object.keys(e).join(",")})`).join(" | ")}]`);
      } else {
        console.log(`\n🔓 Tx ${sig.slice(0, 16)}… — ${decodedEvents.length} events`);
      }

      // ── Correlate fill events with preceding place-order context ──
      //
      //  Event order within a Deriverse tx:
      //    tag 10 spotPlaceOrder / tag 18 perpPlaceOrder → instrId, orderType, ioc, leverage
      //    tag 11 spotFillOrder  / tag 19 perpFillOrder  → price, qty/perps, crncy, rebates
      //    tag 15 spotFees       / tag 23 perpFees       → fees, refPayment

      let ctx = {
        instrId: null as number | null,
        orderType: null as number | null,
        ioc: false,
        leverage: null as number | null,
      };

      for (const ev of decodedEvents) {
        // Place-order events — capture context
        if (ev.tag === 10 || ev.tag === 18) {
          ctx = {
            instrId: ev.instrId ?? null,
            orderType: ev.orderType ?? null,
            ioc: ev.ioc === 1,
            leverage: ev.leverage ?? null,
          };
        }

        // Fill events — emit trade
        const isFill = ev.tag === 11 || ev.tag === 19;
        if (!isFill) continue;

        const instrId = ctx.instrId ?? ev.instrId ?? null;
        const sizeRaw = ev.qty ?? ev.perps ?? null;

        trades.push({
          signature: sig,
          side: ev.side === 0 ? "BUY" : ev.side === 1 ? "SELL" : "UNKNOWN",
          marketType: ev.tag === 11 ? "SPOT" : "PERP",
          orderType: ORDER_TYPES[ctx.orderType ?? -1] ?? "UNKNOWN",
          ioc: ctx.ioc,
          price: ev.price ?? null,
          sizeRaw,
          crncy: ev.crncy ?? null,
          rebates: ev.rebates ?? null,
          instrumentId: instrId,
          pair: instrId != null
            ? (INSTRUMENT_PAIRS[instrId] ?? `Instrument #${instrId}`)
            : "UNKNOWN",
          leverage: ctx.leverage,
          orderId: ev.orderId ?? null,
          clientId: ev.clientId ?? null,
          tag: ev.tag,
          blockTime: sigInfo.blockTime
            ? new Date(Number(sigInfo.blockTime) * 1000)
            : null,
          slot: sigInfo.slot ? Number(sigInfo.slot) : null,
          raw: ev,
        });
      }
    } catch (err: any) {
      console.error(`⚠️  Error processing tx ${sig.slice(0, 16)}…: ${err.message}`);
    }
  }

  // 3. Summary
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Total trades found: ${trades.length}`);
  console.log(`═══════════════════════════════════════════\n`);

  for (const t of trades) {
    console.log(
      `  ${(t.side ?? "?").padEnd(7)} ` +
      `${t.marketType.padEnd(7)} ` +
      `${t.orderType.padEnd(13)} ` +
      `pair=${t.pair.padEnd(16)} ` +
      `instrId=${String(t.instrumentId ?? "?").padEnd(4)} ` +
      `price=${t.price ?? "N/A"}  size=${t.sizeRaw ?? "N/A"}  ` +
      `${t.blockTime?.toISOString() ?? ""}`,
    );
  }

  return trades;
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const wallet = process.argv[2] ?? "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";
  fetchTrades(wallet).catch(console.error);
}
