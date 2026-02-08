// debug-deriverse-state.js
import { Engine, PROGRAM_ID, VERSION } from '@deriverse/kit';
import { createSolanaRpc, devnet } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";

async function debugDexState() {
  const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
  
  console.log("=== Debugging Deriverse DEX State ===");
  console.log("Program ID:", PROGRAM_ID.toString());
  
  const engine = new Engine(rpc, { programId: PROGRAM_ID, version: VERSION });
  
  try {
    console.log("\n[1] Attempting engine.initialize()...");
    await engine.initialize();
    console.log("✓ Engine initialized");
    
    console.log("\n[2] Checking root state...");
    if (engine.rootStateModel) {
      console.log("Root state loaded");
      console.log("- Admin:", engine.rootStateModel.admin?.toString());
      console.log("- LUT Address:", engine.rootStateModel.lutAddress?.toString());
      console.log("- Token count:", engine.rootStateModel.tokenList?.length || 0);
    } else {
      console.log("❌ No root state loaded");
    }
    
    console.log("\n[3] Checking community state...");
    if (engine.community) {
      console.log("Community state loaded");
    } else {
      console.log("❌ No community state");
    }
    
    console.log("\n[4] Checking if tokens are registered...");
    
    // Check common devnet mints
    const commonTokens = {
      "SOL": "So11111111111111111111111111111111111111112",
      "USDC": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    };
    
    for (const [name, mint] of Object.entries(commonTokens)) {
      const tokenId = await engine.getTokenId(mint);
      console.log(`${name}: tokenId = ${tokenId}`);
    }
    
    console.log("\n[5] Checking existing instruments...");
    console.log("Total instruments:", engine.instruments.size);
    
    if (engine.instruments.size > 0) {
      console.log("\nAvailable trading pairs:");
      Array.from(engine.instruments.entries()).forEach(([id, instr], index) => {
        if (index < 5) { // Show first 5
          console.log(`  ${id}:`, {
            assetTokenId: instr.header.assetTokenId,
            crncyTokenId: instr.header.crncyTokenId,
            bestBid: instr.header.bestBid,
            bestAsk: instr.header.bestAsk,
          });
        }
      });
    } else {
      console.log("❌ No trading pairs configured");
    }
    
  } catch (error) {
    console.error("\n❌ Error during debugging:", error.message);
    
    if (error.message.includes("Cannot read properties of null")) {
      console.log("\n🔍 This suggests the root or community account doesn't exist.");
      console.log("The DEX program might be deployed but not initialized.");
    }
  }
}

debugDexState();