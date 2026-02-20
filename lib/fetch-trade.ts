import "dotenv/config";
import { rpc, deriverseEngine } from "./deriverse";

// Helper to prevent 429 Rate Limit errors
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMyTrades(wallet: string) {
  const programId =
    process.env.PROGRAM_ID || "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu";

  try {
    let signaturesResponse: any;

    // 1. Fetch Signatures
    try {
      signaturesResponse = await (rpc as any)
        .getSignaturesForAddress(wallet as any, { limit: 100 })
        .send();
    } catch (err1: any) {
      try {
        signaturesResponse = await (rpc as any)
          .getSignaturesForAddress(programId as any, { limit: 100 })
          .send();
      } catch (err2: any) {
        console.error("❌ Failed to fetch signatures.");
        return [];
      }
    }

    const signatures = Array.isArray(signaturesResponse)
      ? signaturesResponse
      : signaturesResponse?.value || [];

    if (!signatures || signatures.length === 0) {
      return [];
    }

    const successfulSignatures = signatures.filter(
      (sig: any) => sig.err === null,
    );
    const trades: any[] = [];

    // 2. Loop through ALL successful signatures (Removed the limit of 10)
    for (let i = 0; i < successfulSignatures.length; i++) {
      const sigInfo = successfulSignatures[i];
      const signature = sigInfo.signature;

      // Rate Limit Protection: Pause every 5 requests
      if (i > 0 && i % 5 === 0) await sleep(500);

      try {
        const txResponse = await (rpc as any)
          .getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
          })
          .send();

        const tx = txResponse?.value || txResponse;
        if (!tx) continue;

        const logMessages = tx.meta?.logMessages || [];
        const decodedEvents: any[] = [];

        // 3. Attempt Standard Decoding
        try {
          const allDecoded = await (deriverseEngine as any).logsDecode(
            logMessages,
          );
          if (
            allDecoded &&
            Array.isArray(allDecoded) &&
            allDecoded.length > 0
          ) {
            decodedEvents.push(...allDecoded);
          }
        } catch (e) {
          // Silent fail on bulk decode, fallback to manual parsing below
        }

        // 4. Fallback: Manual "Program data" parsing if standard decode failed
        if (decodedEvents.length === 0) {
          const programDataLogs = logMessages
            .filter((l: string) => l.includes("Program data:"))
            .map(
              (l: string) => l.match(/Program data:\s*([A-Za-z0-9+/=]+)/i)?.[1],
            )
            .filter(Boolean);

          for (const base64Data of programDataLogs) {
            try {
              const decoded = await (deriverseEngine as any).logsDecode([
                `Program data: ${base64Data}`,
              ]);
              if (decoded && decoded.length > 0) decodedEvents.push(...decoded);
            } catch {}
          }
        }

        // 5. Map Events to Trades
        for (const event of decodedEvents) {
          const isTradeEvent =
            event.tag === 11 || // spotFillOrder
            event.tag === 19 || // perpFillOrder
            event.price !== undefined ||
            event.qty !== undefined ||
            event.perps !== undefined;

          if (isTradeEvent) {
            // Standardize Fields
            const side =
              event.side === 0 ? "BUY" : event.side === 1 ? "SELL" : "UNKNOWN";
            const price = event.price ? Number(event.price) : null;
            const size =
              event.qty || event.perps
                ? Number(event.qty || event.perps) / 1e9
                : null;
            const fee = event.rebates ? -Number(event.rebates) / 1e9 : null;

            // Critical ID Fixes
            const marketType = event.tag === 19 ? "PERP" : "SPOT";
            // Use ?? to allow ID 0 (SOL) to pass through
            const instrumentId =
              event.instrId ?? event.instrumentId ?? event.instrument_id ?? 1;

            trades.push({
              signature,
              side,
              price,
              size,
              fee,
              feeRebates: fee,
              orderId: event.orderId || null,
              clientId: event.clientId || null,
              instrumentId: Number(instrumentId),
              tag: event.tag,
              marketType,
              orderType: "MARKET",
              blockTime: sigInfo.blockTime
                ? new Date(Number(sigInfo.blockTime) * 1000)
                : null,
              slot: sigInfo.slot ? Number(sigInfo.slot) : null,
              decodedEvent: event,
            });
          }
        }

        // 6. Last Resort: Raw Log Parsing (Regex)
        if (decodedEvents.length === 0) {
          for (const log of logMessages) {
            const lowerLog = log.toLowerCase();
            if (
              lowerLog.includes("taker buy") ||
              lowerLog.includes("taker sell") ||
              lowerLog.includes("fill")
            ) {
              const side = lowerLog.includes("buy") ? "BUY" : "SELL";
              const priceMatch = log.match(/price[=:]\s*([\d.]+)/i);
              const sizeMatch = log.match(/size[=:]\s*([\d.]+)/i);
              const feeMatch = log.match(/fee[=:]\s*([\d.]+)/i);

              trades.push({
                signature,
                side,
                price: priceMatch ? parseFloat(priceMatch[1]) : 0,
                size: sizeMatch ? parseFloat(sizeMatch[1]) : 0,
                fee: feeMatch ? parseFloat(feeMatch[1]) : 0,
                marketType: "UNKNOWN",
                orderType: "MARKET",
                instrumentId: 1, // Default to SOL if unknown
                blockTime: sigInfo.blockTime
                  ? new Date(Number(sigInfo.blockTime) * 1000)
                  : null,
                slot: sigInfo.slot ? Number(sigInfo.slot) : null,
                logMessage: log,
              });
            }
          }
        }
      } catch (err: any) {
        // Skip individual failed transactions without crashing the loop
        continue;
      }
    }

    return trades;
  } catch (err: any) {
    console.error("❌ Fatal Error fetching trades:", err.message);
    return [];
  }
}

if (require.main === module) {
  const testWallet = process.env.TEST_WALLET;
  console.log(`Running fetch for ${testWallet}...`);
  fetchMyTrades(testWallet).then((t) => console.table(t));
}
