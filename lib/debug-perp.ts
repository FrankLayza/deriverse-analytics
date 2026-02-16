import "dotenv/config";
import { rpc, deriverseEngine } from "./deriverse";

// Helper to pause execution (Rate Limit handling)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function debugPerpTrades(wallet: string) {
  console.log("🔍 Scanning for PERP trades...");

  // 1. Fetch last 50 signatures (Reduced from 100 to save requests)
  const signatures = await (rpc as any)
    .getSignaturesForAddress(wallet as any, { limit: 50 })
    .send();
  
  const validSigs = Array.isArray(signatures) ? signatures : signatures.value || [];

  console.log(`📊 Found ${validSigs.length} transactions. Scanning logs...`);

  let perpFoundCount = 0;

  for (const sigInfo of validSigs) {
    // 🛑 RATE LIMIT PAUSE: Wait 1 second between requests
    await sleep(1000);

    try {
        // 2. Get Transaction
        const txResponse = await (rpc as any)
        .getTransaction(sigInfo.signature, { maxSupportedTransactionVersion: 0 })
        .send();
        
        const tx = txResponse?.value || txResponse;
        if (!tx || !tx.meta?.logMessages) continue;

        const logs = tx.meta.logMessages;
        const logsStr = logs.join(" ");

        // 3. Heuristic: Look for keywords "Perp", "Position", "Funding", or "Liquidate"
        const isSuspicious = 
            logsStr.toLowerCase().includes("perp") || 
            logsStr.toLowerCase().includes("position") ||
            logsStr.toLowerCase().includes("funding");

        if (isSuspicious) {
            console.log(`\n🔎 Potentially found PERP Tx: ${sigInfo.signature}`);
            
            // 4. Decode EVERYTHING
            try {
                const decoded = await (deriverseEngine as any).logsDecode(logs);
                
                if (decoded && decoded.length > 0) {
                    console.log("🔓 Decoded Events Found:");
                    // Dump the entire object to inspect structure
                    console.dir(decoded, { depth: null, colors: true });
                    
                    perpFoundCount++;
                    if (perpFoundCount >= 3) {
                        console.log("\n✅ Found enough examples. Stopping early.");
                        return; 
                    }
                } else {
                     console.log("⚠️ Could not decode events (decoder returned empty).");
                }
            } catch (e: any) {
                console.log(`❌ Decode error: ${e.message}`);
            }
        } else {
             process.stdout.write("."); // Progress dot for non-perp txs
        }
    } catch (err: any) {
        if (err.message.includes("429")) {
            console.log("\n⚠️ Hit rate limit again. Waiting 5 seconds...");
            await sleep(5000);
        } else {
            console.log(`\n❌ Error fetching tx: ${err.message}`);
        }
    }
  }
}

// Run it
if (require.main === module) {
    debugPerpTrades("FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q");
}