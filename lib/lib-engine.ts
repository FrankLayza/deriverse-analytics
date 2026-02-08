/**
 * Deriverse Engine Initializer
 * Simple, clean initialization for fetching trading data
 */

import { Engine } from '@deriverse/kit';
import { createSolanaRpc, address, devnet } from '@solana/kit';

let engine: Engine | null = null;
let engineNetwork: 'devnet' | 'mainnet' | null = null;

export type NetworkConfig = {
  label: 'devnet' | 'mainnet';
  rpcUrl: string;
  programId: string;
  version: number;
};

export function getNetworkConfigs(): NetworkConfig[] {
  const devnetRpc =
    process.env.NEXT_PUBLIC_RPC_HTTP ||
    process.env.RPC_HTTP ||
    'https://api.devnet.solana.com';
  const mainnetRpc =
    process.env.MAINNET_RPC_HTTP || 'https://api.mainnet-beta.solana.com';

  const devnetProgramId =
    process.env.DERIVERSE_PROGRAM_ID_DEVNET ||
    process.env.PROGRAM_ID ||
    'Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu';
  const mainnetProgramId =
    process.env.DERIVERSE_PROGRAM_ID_MAINNET ||
    process.env.PROGRAM_ID_MAINNET ||
    devnetProgramId;

  const devnetVersion = Number(
    process.env.DERIVERSE_VERSION_DEVNET || process.env.VERSION || '12'
  );
  const mainnetVersion = Number(
    process.env.DERIVERSE_VERSION_MAINNET ||
      process.env.VERSION_MAINNET ||
      devnetVersion
  );

  return [
    {
      label: 'devnet',
      rpcUrl: devnetRpc,
      programId: devnetProgramId,
      version: devnetVersion,
    },
    {
      label: 'mainnet',
      rpcUrl: mainnetRpc,
      programId: mainnetProgramId,
      version: mainnetVersion,
    },
  ];
}

export function getPreferredNetworkConfig(): NetworkConfig {
  const preferred = (process.env.DERIVERSE_NETWORK || '').toLowerCase();
  const configs = getNetworkConfigs();
  if (preferred === 'devnet' || preferred === 'mainnet') {
    return configs.find(cfg => cfg.label === preferred) ?? configs[0];
  }
  return configs[0];
}

export function createRpcFromConfig(cfg: NetworkConfig) {
  return cfg.label === 'devnet'
    ? createSolanaRpc(devnet(cfg.rpcUrl))
    : createSolanaRpc(cfg.rpcUrl);
}

/**
 * Get or create Deriverse Engine instance
 * Initializes only once and reuses the same instance
 */
export async function getEngine(): Promise<Engine> {
  if (!engine) {
    console.log('?? Initializing Deriverse Engine...');

    const preferred = (process.env.DERIVERSE_NETWORK || '').toLowerCase();
    const configs = getNetworkConfigs().filter(cfg => {
      if (preferred === 'devnet' || preferred === 'mainnet') {
        return cfg.label === preferred;
      }
      return true;
    });

    let lastError: unknown = null;
    for (const cfg of configs) {
      try {
        console.log(`?? Trying ${cfg.label}...`);

        const rpc =
          cfg.label === 'devnet'
            ? createSolanaRpc(devnet(cfg.rpcUrl))
            : createSolanaRpc(cfg.rpcUrl);

        const candidate = new Engine(rpc, {
          programId: address(cfg.programId),
          version: cfg.version,
          commitment: 'confirmed',
        });

        await candidate.initialize();

        engine = candidate;
        engineNetwork = cfg.label;

        console.log(
          `? Engine initialized on ${cfg.label} (program ${cfg.programId}, version ${cfg.version})`
        );
        break;
      } catch (error) {
        lastError = error;
        console.warn(`??  ${cfg.label} init failed, trying next...`, error);
      }
    }

    if (!engine) {
      throw lastError || new Error('Failed to initialize Deriverse Engine on any network');
    }
  }

  return engine;
}

/**
 * Reset engine (useful for testing or switching networks)
 */
export function resetEngine(): void {
  engine = null;
  engineNetwork = null;
  console.log('?? Engine reset');
}
