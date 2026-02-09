import { Engine } from '@deriverse/kit'
import { createSolanaRpc } from '@solana/kit'

let engine: Engine | null = null
let rpc: ReturnType<typeof createSolanaRpc> | null = null

export async function getDeriverse() {
  if (engine && rpc) return { engine, rpc }

  rpc = createSolanaRpc(process.env.RPC_HTTP!)
  engine = new Engine(rpc)
  await engine.initialize()

  console.log('[Deriverse] Engine initialized')

  return { engine, rpc }
}