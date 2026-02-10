import { createSolanaRpc, devnet } from "@solana/kit";
import { Engine } from '@deriverse/kit';

/**
 * DERIVERSE PROTOCOL CONFIGURATION
 * Provides the RPC connection and the Protocol Engine used 
 * exclusively for binary log decoding (logsDecode).
 */

const rpcUrl = process.env.SOLANA_RPC_HTTP || "https://api.devnet.solana.com";
export const rpc = createSolanaRpc(devnet(rpcUrl));

const programId = (process.env.PROGRAM_ID || "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu") as any;
const version = 14; 

// The engine is kept for its IDL-based decoding capabilities
export const deriverseEngine = new Engine(rpc, { programId, version });
export { programId };