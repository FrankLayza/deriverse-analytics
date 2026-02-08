/**
 * Manual Deriverse Log Decoder
 * Decodes base64 program data without needing initialize()
 */

import { createSolanaRpc, address, devnet } from '@solana/kit';

const WALLET = "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";

// Deriverse log type identifiers (from their SDK)
const LOG_TYPES = {
  1: 'DepositReport',
  3: 'WithdrawReport',
  10: 'SpotPlaceOrderReport',
  11: 'SpotOrderCancelReport',
  18: 'SpotFillOrderReport',
  19: 'PerpFillOrderReport',
  // Add more as needed
};

function decodeBase64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

function readU8(buffer: Buffer, offset: number): number {
  return buffer.readUInt8(offset);
}

function readU32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function readU64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset);
}

function decodeDeriverseLog(base64Data: string) {
  try {
    const buffer = decodeBase64ToBuffer(base64Data);
    
    // First byte is the log type
    const logType = readU8(buffer, 0);
    const logTypeName = LOG_TYPES[logType as keyof typeof LOG_TYPES] || `Unknown(${logType})`;
    
    console.log(`\n  Log Type: ${logType} (${logTypeName})`);
    console.log(`  Buffer length: ${buffer.length} bytes`);
    console.log(`  Raw hex: ${buffer.toString('hex')}`);
    
    // Try to decode based on type
    if (logType === 18 || logType === 19) {
      // SpotFillOrderReport or PerpFillOrderReport
      try {
        const decoded = {
          logType,
          logTypeName,
          // These offsets are guesses - we'll adjust based on output
          field1: readU32LE(buffer, 1),
          field2: readU32LE(buffer, 5),
          field3: readU64LE(buffer, 9),
          field4: readU64LE(buffer, 17),
          field5: readU64LE(buffer, 25),
          field6: readU64LE(buffer, 33),
          // Add more fields as we discover the structure
        };
        
        console.log('  Decoded fields:');
        console.log(`    field1: ${decoded.field1}`);
        console.log(`    field2: ${decoded.field2}`);
        console.log(`    field3: ${decoded.field3}`);
        console.log(`    field4: ${decoded.field4}`);
        console.log(`    field5: ${decoded.field5}`);
        console.log(`    field6: ${decoded.field6}`);
        
        return decoded;
      } catch (e) {
        console.log('  Error decoding fields:', (e as Error).message);
      }
    } else if (logType === 10) {
      // SpotPlaceOrderReport
      console.log('  (Place Order - not a fill)');
    } else if (logType === 1) {
      // DepositReport
      console.log('  (Deposit - not a trade)');
    }
    
    return { logType, logTypeName, buffer: buffer.toString('hex') };
    
  } catch (error) {
    console.log('  Decode error:', (error as Error).message);
    return null;
  }
}

async function inspectProgramData() {
  console.log('🔍 Decoding Deriverse Program Data\n');

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_HTTP || 'https://api.devnet.solana.com';
  const rpc = createSolanaRpc(devnet(rpcUrl));

  const signatures = await rpc
    .getSignaturesForAddress(address(WALLET), { limit: 10 })
    .send();

  console.log(`Found ${signatures.length} transactions\n`);

  for (const sigInfo of signatures) {
    console.log('─'.repeat(80));
    console.log(`Transaction: ${sigInfo.signature.slice(0, 16)}...`);
    console.log(`Time: ${sigInfo.blockTime ? new Date(Number(sigInfo.blockTime) * 1000).toLocaleString() : 'N/A'}`);
    
    const tx = await rpc.getTransaction(sigInfo.signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
      encoding: 'jsonParsed',
    }).send();

    if (!tx?.meta?.logMessages) {
      console.log('No logs\n');
      continue;
    }

    // Find "Program data:" lines
    const programDataLogs = tx.meta.logMessages.filter(log => 
      log.startsWith('Program data: ')
    );

    if (programDataLogs.length === 0) {
      console.log('No program data found\n');
      continue;
    }

    console.log(`\nFound ${programDataLogs.length} program data log(s):`);

    programDataLogs.forEach((log, index) => {
      const base64Data = log.replace('Program data: ', '');
      console.log(`\n📊 Program Data #${index + 1}:`);
      console.log(`  Base64: ${base64Data}`);
      
      const decoded = decodeDeriverseLog(base64Data);
      
      if (decoded) {
        console.log(`  ✅ Decoded successfully`);
      }
    });

    console.log('');
  }
}

inspectProgramData().catch(console.error);