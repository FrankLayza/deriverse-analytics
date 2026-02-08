const { createSolanaRpc, address, devnet, signature } = require("@solana/kit");
const bs58 = require("bs58");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

/**
 * Decode Base64 Deriverse program data
 */
function decodeDeriverseLog(base64Data) {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Parse based on your actual Base64 patterns from logs:
    // "EgAAAY8D..." = 0x11 0x00 0x00 0x01 0x8F 0x03
    // "CgABAY8D..." = 0x0A 0x00 0x01 0x01 0x8F 0x03
    
    if (buffer.length < 8) return null;
    
    const eventType = buffer.readUInt8(0);
    
    // Check if it's a fill event (0x0A, 0x11, 0x45 are common)
    if (eventType === 0x0A || eventType === 0x11 || eventType === 0x45) {
      // Try to extract price and quantity (adjust offsets based on actual data)
      const price = buffer.readFloatLE(4);   // Price at bytes 4-7
      const quantity = buffer.readFloatLE(8); // Quantity at bytes 8-11
      const side = buffer.readUInt8(12);     // Side at byte 12 (0=buy, 1=sell)
      
      return {
        type: eventType === 0x45 ? 'SPOT' : 'PERP',
        price,
        quantity,
        side: side === 0 ? 'BUY' : 'SELL',
        raw: base64Data.substring(0, 30) + '...'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function getTradeHistory(walletAddress) {
  console.log("🔍 Fetching Deriverse trades...");
  console.log(`Wallet: ${walletAddress}\n`);
  
  // Use Helius RPC (more reliable)
  const RPC_URL = process.env.RPC_HTTP;
  const rpc = createSolanaRpc(devnet(RPC_URL));
  
  // Get transaction signatures
  let signatures = [];
  try {
    const response = await rpc.getSignaturesForAddress(
      address(walletAddress), 
      { limit: 50, commitment: 'confirmed' }
    ).send();
    
    // Handle different response formats
    signatures = Array.isArray(response) ? response : 
                (Array.isArray(response.value) ? response.value : []);
    
  } catch (error) {
    console.error("❌ RPC error:", error.message);
    return;
  }
  
  console.log(`📊 Found ${signatures.length} transactions\n`);
  
  if (signatures.length === 0) {
    console.log("💡 Check on explorer: https://explorer.solana.com/address/" + walletAddress + "?cluster=devnet");
    return;
  }
  
  const trades = [];
  
  // Process each transaction
  for (let i = 0; i < signatures.length; i++) {
    const sigInfo = signatures[i];
    
    // Parse signature (handle different formats)
    let sigStr;
    try {
      sigStr = typeof sigInfo.signature === 'string' ? sigInfo.signature :
              (sigInfo.signature?.base58 || bs58.encode(sigInfo.signature?.bytes || new Uint8Array()));
    } catch {
      continue;
    }
    
    console.log(`[${i+1}/${signatures.length}] ${sigStr.substring(0, 16)}...`);
    
    try {
      // Get transaction
      const txResponse = await rpc.getTransaction(
        signature(sigStr),
        { 
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
          encoding: 'jsonParsed'
        }
      ).send();
      
      const tx = txResponse.value;
      if (!tx?.meta?.logMessages) continue;
      
      // Look for Deriverse program data
      const programDataLogs = tx.meta.logMessages.filter(log => 
        log.includes('Program data:') && 
        (log.includes('EgAAAY8D') || log.includes('CgABAY8D') || log.includes('AwAAAI8D'))
      );
      
      if (programDataLogs.length === 0) continue;
      
      // Decode each log
      for (const log of programDataLogs) {
        const base64Data = log.replace('Program data:', '').trim();
        const decoded = decodeDeriverseLog(base64Data);
        
        if (decoded) {
          trades.push({
            signature: sigStr.substring(0, 16) + '...',
            type: decoded.type,
            side: decoded.side,
            price: decoded.price,
            quantity: decoded.quantity,
            timestamp: sigInfo.blockTime ? 
              new Date(sigInfo.blockTime * 1000).toLocaleString() : 'N/A',
            explorer: `https://explorer.solana.com/tx/${sigStr}?cluster=devnet`
          });
          
          console.log(`   ✅ ${decoded.type} ${decoded.side} @ $${decoded.price}`);
        }
      }
      
    } catch (error) {
      // Skip failed transactions
      continue;
    }
  }
  
  // Results
  console.log(`\n📊 RESULTS:`);
  console.log(`Transactions: ${signatures.length}`);
  console.log(`Deriverse Trades: ${trades.length}\n`);
  
  if (trades.length === 0) {
    console.log("❌ No Deriverse trades decoded.");
    console.log("\n💡 Debug steps:");
    console.log("1. Check Base64 patterns in logs");
    console.log("2. Update decodeDeriverseLog() with actual offsets");
    console.log("3. Try manual decoding of one transaction:");
    
    // Show sample Base64 for debugging
    if (signatures.length > 0) {
      console.log("\n📝 Sample debug (first transaction):");
      try {
        const sigStr = typeof signatures[0].signature === 'string' ? 
          signatures[0].signature : signatures[0].signature?.base58;
        
        const txResponse = await rpc.getTransaction(
          signature(sigStr),
          { maxSupportedTransactionVersion: 0, commitment: 'confirmed', encoding: 'jsonParsed' }
        ).send();
        
        if (txResponse.value?.meta?.logMessages) {
          const programLogs = txResponse.value.meta.logMessages.filter(l => l.includes('Program data:'));
          if (programLogs.length > 0) {
            const base64 = programLogs[0].replace('Program data:', '').trim();
            console.log(`Base64: ${base64.substring(0, 80)}...`);
            console.log(`Length: ${base64.length} chars`);
            console.log(`Buffer: ${Buffer.from(base64, 'base64').toString('hex').substring(0, 64)}...`);
          }
        }
      } catch (e) {}
    }
    
    return;
  }
  
  // Display trades
  console.log("📈 TRADES FOUND:");
  console.table(trades.map(t => ({
    Type: t.type,
    Side: t.side,
    Price: `$${t.price.toFixed(4)}`,
    Quantity: t.quantity.toFixed(4),
    Time: t.timestamp
  })));
  
  // Save data
  const fs = require('fs');
  const output = {
    wallet: walletAddress,
    totalTransactions: signatures.length,
    deriverseTrades: trades.length,
    trades: trades,
    generated: new Date().toISOString()
  };
  
  fs.writeFileSync(`trades_${Date.now()}.json`, JSON.stringify(output, null, 2));
  console.log(`\n💾 Saved to: trades_${Date.now()}.json`);
}

// Run with your wallet
const testWallet = "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";
getTradeHistory(testWallet);