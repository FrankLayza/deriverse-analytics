/**
 * Deriverse Engine Initializer
 * Simple, clean initialization for fetching trading data
 */

import { Engine, PROGRAM_ID } from '@deriverse/kit';
import { createSolanaRpc, address, devnet } from '@solana/kit';

let engine: Engine | null = null;

/**
 * Get or create Deriverse Engine instance
 * Initializes only once and reuses the same instance
 */
export async function getEngine(): Promise<Engine> {
  if (!engine) {
    console.log('🔧 Initializing Deriverse Engine...');
    
    // Create RPC connection
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_HTTP || 'https://api.devnet.solana.com';
    const rpc = createSolanaRpc(devnet(rpcUrl));
    
    // Create engine
    engine = new Engine(rpc, { 
      programId: PROGRAM_ID, 
      version: 1,
      commitment: 'confirmed' 
    });
    
    // Initialize (loads Root and Community state)
    await engine.initialize();
    
    console.log('✅ Engine initialized');
  }
  
  return engine;
}

/**
 * Reset engine (useful for testing or switching networks)
 */
export function resetEngine(): void {
  engine = null;
  console.log('🔄 Engine reset');
}