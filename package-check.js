import {
  createSolanaRpc,
  createKeyPairSignerFromBytes,
  devnet,
} from "@solana/kit";
import {
  Engine,
  PROGRAM_ID, // From package: DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD
  VERSION, // From package: 1
} from "@deriverse/kit";
import { readFileSync } from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({path: path.resolve(__dirname, './.env.local')});

async function initializeEngine() {
  // Use environment RPC or fallback
  const rpcUrl = process.env.RPC_HTTP || "https://api.devnet.solana.com";
  const rpc = createSolanaRpc(devnet(rpcUrl));

  console.log("=== Initializing Deriverse Engine ===");
  console.log("Using PROGRAM_ID:", PROGRAM_ID);
  console.log("Using VERSION:", VERSION);
  console.log("Using RPC:", rpcUrl);

  // Load wallet
  if (!process.env.NEXT_PUBLIC_KEYPAIR_FILENAME) {
    throw new Error("NEXT_PUBLIC_KEYPAIR_FILENAME not set in .env");
  }

  const keypairFile = readFileSync(process.env.NEXT_PUBLIC_KEYPAIR_FILENAME);
  const keypairBytes = new Uint8Array(JSON.parse(keypairFile.toString()));
  const signer = await createKeyPairSignerFromBytes(keypairBytes);

  console.log("Wallet address:", signer.address.toString());

  // Create engine with PACKAGE constants
  const engine = new Engine(rpc, {
    programId: PROGRAM_ID,
    version: VERSION,
  });

  try {
    console.log("\n[1/3] Initializing engine...");
    await engine.initialize();
    console.log("✓ Engine initialized");

    console.log("\n[2/3] Setting signer...");
    await engine.setSigner(signer.address);

    if (engine.originalClientId) {
      console.log("✓ Client ID:", engine.originalClientId);
    } else {
      console.log("⚠ No existing client account");
    }

    console.log("\n[3/3] Fetching client data...");
    const clientData = await engine.getClientData();
    console.log("✓ Client data loaded");

    // Display balances
    console.log("\n=== Your Balances ===");
    clientData.tokens.forEach((balance, tokenId) => {
      console.log(`Token ${tokenId}: ${balance.amount} units`);
    });

    // Display positions
    if (clientData.spot.size > 0) {
      console.log("\n=== Spot Positions ===");
      clientData.spot.forEach((position, instrId) => {
        console.log(`Instrument ${instrId}:`, position);
      });
    }

    if (clientData.perp.size > 0) {
      console.log("\n=== Perp Positions ===");
      clientData.perp.forEach((position, instrId) => {
        console.log(`Instrument ${instrId}:`, position);
      });
    }

    return engine;
  } catch (error) {
    console.error("\n❌ Initialization failed!");
    console.error("Error:", error.message);

    // Specific error handling
    if (error.message.includes("offset out of range")) {
      console.log("\n🔧 Troubleshooting tips:");
      console.log("1. Check if RPC endpoint is working");
      console.log("2. Verify program is deployed at:", PROGRAM_ID);
      console.log("3. Try different RPC: https://devnet.helius-rpc.com/");
    }

    throw error;
  }
}

// Run initialization
initializeEngine()
  .then((engine) => {
    console.log("\n✅ Engine ready! You can now:");
    console.log("- Fetch trade history");
    console.log("- Place orders");
    console.log("- Check balances");
  })
  .catch((error) => {
    console.error("Failed to initialize:", error);
    process.exit(1);
  });
