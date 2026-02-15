import "dotenv/config";
import { rpc, deriverseEngine } from "./deriverse";

export async function fetchMyTrades(wallet: string) {
  const programId =
    process.env.PROGRAM_ID || "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu";

  console.log("🔍 Fetching transaction signatures for wallet:", wallet);
  console.log("📋 Program ID:", programId);

  try {
    let signaturesResponse: any;

    try {
      signaturesResponse = await (rpc as any)
        .getSignaturesForAddress(wallet as any, { limit: 100 })
        .send();
    } catch (err1: any) {
      console.log("⚠️  Method 1 failed, trying alternative...");
      try {
        signaturesResponse = await (rpc as any)
          .getSignaturesForAddress(programId as any, { limit: 100 })
          .send();
      } catch (err2: any) {
        console.error("❌ Both methods failed:");
        console.error(`  Method 1 error: ${err1.message}`);
        console.error(`  Method 2 error: ${err2.message}`);
        return [];
      }
    }

    const signatures = Array.isArray(signaturesResponse)
      ? signaturesResponse
      : signaturesResponse?.value || [];

    if (!signatures || signatures.length === 0) {
      console.log("❌ No transactions found");
      return [];
    }

    console.log(`✅ Found ${signatures.length} transactions`);

    const successfulSignatures = signatures.filter((sig: any) => {
      return sig.err === null;
    });

    console.log(
      `📊 Processing ${successfulSignatures.length} successful transactions...`,
    );

    const trades: any[] = [];

    for (let i = 0; i < Math.min(successfulSignatures.length, 10); i++) {
      const sigInfo = successfulSignatures[i];
      const signature = sigInfo.signature;

      try {
        const txResponse = await (rpc as any)
          .getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
          })
          .send();

        const tx = txResponse?.value || txResponse;

        if (!tx) {
          console.log(`⚠️  No transaction data for signature: ${signature}`);
          continue;
        }

        const logMessages = tx.meta?.logMessages || [];

        const programDataLogs: string[] = [];
        for (const log of logMessages) {
          const programDataMatch = log.match(
            /Program data:\s*([A-Za-z0-9+/=]+)/i,
          );
          if (programDataMatch) {
            programDataLogs.push(programDataMatch[1]);
          }
        }

        let decodedEvents: any[] = [];
        if (programDataLogs.length > 0) {
          console.log(
            `\n🔍 Found ${programDataLogs.length} Program data entries for ${signature.substring(0, 16)}...`,
          );

          try {
            console.log(
              `   🔓 Attempting to decode all logs using logsDecode...`,
            );
            const allDecoded = await (deriverseEngine as any).logsDecode(
              logMessages,
            );
            if (
              allDecoded &&
              Array.isArray(allDecoded) &&
              allDecoded.length > 0
            ) {
              decodedEvents.push(...allDecoded);
              console.log(
                `   ✅ Successfully decoded ${allDecoded.length} event(s)`,
              );
            } else {
              console.log(
                `   ⚠️  logsDecode returned empty or invalid result:`,
                allDecoded,
              );
            }
          } catch (decodeErr: any) {
            console.log(
              `   ⚠️  Failed to decode all logs: ${decodeErr.message}`,
            );
            if (decodeErr.stack) {
              console.log(`   Stack: ${decodeErr.stack.split("\n")[0]}`);
            }

            console.log(`   🔄 Trying individual Base64 decoding...`);
            for (
              let idx = 0;
              idx < Math.min(programDataLogs.length, 3);
              idx++
            ) {
              const base64Data = programDataLogs[idx];
              try {
                const formats = [
                  `Program ${programId} data: ${base64Data}`,
                  `Program data: ${base64Data}`,
                  `Program log: ${base64Data}`,
                ];

                for (const formattedLog of formats) {
                  try {
                    const decoded = await (deriverseEngine as any).logsDecode([
                      formattedLog,
                    ]);
                    if (
                      decoded &&
                      Array.isArray(decoded) &&
                      decoded.length > 0
                    ) {
                      decodedEvents.push(...decoded);
                      console.log(
                        `   ✅ Decoded entry ${idx + 1} with format: "${formattedLog.substring(0, 50)}..."`,
                      );
                      break;
                    }
                  } catch (fmtErr: any) {
                    // Try next format
                  }
                }
              } catch (entryErr: any) {
                console.log(
                  `   ⚠️  Failed to decode entry ${idx + 1}: ${entryErr.message}`,
                );
              }
            }
          }
        } else {
          console.log(
            `\n🔓 No Program data entries found, attempting to decode all logs...`,
          );
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
              console.log(
                `✅ Decoded ${allDecoded.length} event(s) from all logs`,
              );
            } else {
              console.log(`⚠️  logsDecode returned empty result`);
            }
          } catch (decodeErr: any) {
            console.log(`⚠️  Could not decode logs: ${decodeErr.message}`);
          }
        }

        // ✅ FIXED: Parse decoded events with correct field mapping
        for (const event of decodedEvents) {
          const isTradeEvent =
            event.tag === 11 ||  // spotFillOrder
            event.tag === 19 ||  // perpFillOrder
            event.price !== undefined ||
            event.qty !== undefined ||
            event.perps !== undefined;

          if (isTradeEvent) {
            // Side: 0 = BUY, 1 = SELL
            const side =
              event.side === 0 ? "BUY" : 
              event.side === 1 ? "SELL" : "UNKNOWN";

            // Price
            const price = event.price || null;
            
            // Size: Different field for SPOT vs PERP
            const rawSize = event.qty || event.perps || null;
            const size = rawSize ? Number(rawSize) / 1e9 : null;
            
            // Fee/Rebates
            const rebates = event.rebates || null;
            const fee = rebates ? -Number(rebates) / 1e9 : null;
            
            // IDs
            const orderId = event.orderId || null;
            const clientId = event.clientId || null;
            const tag = event.tag || null;
            
            // ✅ FIX 1: Market type from tag (NOT from event.orderType which doesn't exist)
            const marketType = tag === 19 ? 'PERP' : tag === 11 ? 'SPOT' : 'UNKNOWN';
            
            // ✅ FIX 2: Order type - NOT AVAILABLE in decoded events
            // According to SDK docs, order type is not returned in fill events
            // We'll default to 'MARKET' since fills don't distinguish
            const orderType = 'MARKET';
            
            // ✅ FIX 3: Instrument ID - might be in event.instrId
            const instrumentId = event.instrId || event.instrumentId || orderId || clientId || 1;

            trades.push({
              signature,
              side,
              price: price ? Number(price) : null,
              size: size,
              fee: fee,
              feeRebates: fee, // Keep for compatibility
              orderId,
              clientId,
              instrumentId,
              tag,
              marketType,      // ✅ Correctly derived from tag
              orderType,       // ✅ Defaults to MARKET
              blockTime: sigInfo.blockTime
                ? new Date(Number(sigInfo.blockTime) * 1000)
                : null,
              slot: sigInfo.slot ? Number(sigInfo.slot) : null,
              decodedEvent: event,
            });

            console.log(`\n💰 Trade Event Found (from decoded data):`);
            console.log(`   Signature: ${signature.substring(0, 16)}...`);
            console.log(`   Tag: ${tag} (${marketType})`);
            console.log(`   Side: ${side} (raw: ${event.side})`);
            console.log(`   Price: ${price || "N/A"}`);
            console.log(`   Size: ${size || "N/A"} (raw: ${rawSize || "N/A"})`);
            console.log(
              `   Fee/Rebates: ${fee || "N/A"} (raw rebates: ${rebates || "N/A"})`,
            );
            console.log(`   Instrument ID: ${instrumentId}`);
            console.log(`   Order ID: ${orderId || "N/A"}`);
            console.log(`   Client ID: ${clientId || "N/A"}`);
            console.log(`   Market Type: ${marketType}`);
            console.log(`   Order Type: ${orderType}`);
          }
        }

        // Fallback: Parse raw log messages (if decoding failed)
        if (decodedEvents.length === 0) {
          for (const log of logMessages) {
            const lowerLog = log.toLowerCase();
            if (
              lowerLog.includes("taker buy") ||
              lowerLog.includes("taker sell") ||
              lowerLog.includes("fill") ||
              lowerLog.includes("trade") ||
              (lowerLog.includes("order") &&
                (lowerLog.includes("executed") ||
                  lowerLog.includes("filled"))) ||
              lowerLog.includes("position")
            ) {
              const side =
                lowerLog.includes("buy") || lowerLog.includes("long")
                  ? "BUY"
                  : lowerLog.includes("sell") || lowerLog.includes("short")
                    ? "SELL"
                    : "UNKNOWN";

              const priceMatch = log.match(/price[=:]\s*([\d.]+)/i);
              const sizeMatch = log.match(/size[=:]\s*([\d.]+)/i);
              const feeMatch = log.match(/fee[=:]\s*([\d.]+)/i);
              const amountMatch = log.match(/amount[=:]\s*([\d.]+)/i);

              trades.push({
                signature,
                side,
                price: priceMatch ? parseFloat(priceMatch[1]) : null,
                size: sizeMatch
                  ? parseFloat(sizeMatch[1])
                  : amountMatch
                    ? parseFloat(amountMatch[1])
                    : null,
                fee: feeMatch ? parseFloat(feeMatch[1]) : null,
                marketType: 'UNKNOWN',
                orderType: 'MARKET',
                blockTime: sigInfo.blockTime
                  ? new Date(Number(sigInfo.blockTime) * 1000)
                  : null,
                slot: sigInfo.slot ? Number(sigInfo.slot) : null,
                logMessage: log,
              });

              console.log(`\n💰 Trade Event Found (from raw logs):`);
              console.log(`   Signature: ${signature}`);
              console.log(`   Side: ${side}`);
              console.log(`   Price: ${priceMatch ? priceMatch[1] : "N/A"}`);
              console.log(
                `   Size: ${sizeMatch ? sizeMatch[1] : amountMatch ? amountMatch[1] : "N/A"}`,
              );
              console.log(`   Fee: ${feeMatch ? feeMatch[1] : "N/A"}`);
            }
          }
        }

        if (logMessages.length > 0 && i === 0) {
          console.log("\n📝 Sample Transaction Logs (first transaction):");
          logMessages.forEach((log: string, idx: number) => {
            console.log(`   [${idx}] ${log}`);
          });
        }
      } catch (err: any) {
        console.error(
          `❌ Error fetching transaction ${signature}:`,
          err.message,
        );
      }
    }

    console.log(`\n✅ Total trades found: ${trades.length}`);

    if (trades.length === 0) {
      console.log("\n💡 Tip: Trade events might be in a different log format.");
      console.log("   Check the sample logs above to see the actual format.");
    }
    
    return trades;
  } catch (err: any) {
    console.error("❌ Error fetching trades:", err.message);
    console.error(err.stack);
    return [];
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  fetchMyTrades("FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q");
}