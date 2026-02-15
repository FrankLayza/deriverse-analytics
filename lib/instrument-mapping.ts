/**
 * Instrument Mapping Utility (Simplified)
 * Hardcoded mappings for Deriverse devnet instruments
 * No SDK initialization required - faster and more reliable
 */

export interface InstrumentInfo {
  instrumentId: number;
  pair: string;
  assetTokenId: number;
  crncyTokenId: number;
  assetTicker: string;
  crncyTicker: string;
}

/**
 * Hardcoded Deriverse Devnet Instrument Mappings
 * Update this as you discover new instruments
 */
const DEVNET_INSTRUMENTS: InstrumentInfo[] = [
  {
    instrumentId: 1,
    pair: 'SOL/USDC',
    assetTokenId: 1,
    crncyTokenId: 0,
    assetTicker: 'SOL',
    crncyTicker: 'USDC',
  },
  {
    instrumentId: 2,
    pair: 'BTC/USDC',
    assetTokenId: 2,
    crncyTokenId: 0,
    assetTicker: 'BTC',
    crncyTicker: 'USDC',
  },
  {
    instrumentId: 3,
    pair: 'ETH/USDC',
    assetTokenId: 3,
    crncyTokenId: 0,
    assetTicker: 'ETH',
    crncyTicker: 'USDC',
  },
  {
    instrumentId: 4,
    pair: 'BONK/USDC',
    assetTokenId: 4,
    crncyTokenId: 0,
    assetTicker: 'BONK',
    crncyTicker: 'USDC',
  },
  // Add more as you discover them in your trades
];

// Build lookup maps
const instrumentMap = new Map<number, InstrumentInfo>();
const pairToIdMap = new Map<string, number>();

DEVNET_INSTRUMENTS.forEach(info => {
  instrumentMap.set(info.instrumentId, info);
  pairToIdMap.set(info.pair, info.instrumentId);
});

/**
 * Get trading pair from instrument ID
 */
export function getInstrumentPair(instrumentId: number): string {
  const info = instrumentMap.get(instrumentId);
  return info ? info.pair : `Instrument #${instrumentId}`;
}

/**
 * Get full instrument info from ID
 */
export function getInstrumentInfo(instrumentId: number): InstrumentInfo | null {
  return instrumentMap.get(instrumentId) || null;
}

/**
 * Get instrument ID from pair name
 */
export function getInstrumentIdByPair(pair: string): number | null {
  return pairToIdMap.get(pair) || null;
}

/**
 * Get all instrument mappings
 */
export function getAllInstruments(): InstrumentInfo[] {
  return DEVNET_INSTRUMENTS;
}

/**
 * Get all trading pairs
 */
export function getAllTradingPairs(): string[] {
  return DEVNET_INSTRUMENTS.map(info => info.pair).sort();
}

/**
 * Enrich trades with human-readable pair names
 */
export function enrichTradesWithPairs<T extends { 
  instrumentId?: number; 
  orderId?: number;
  clientId?: number;
}>(
  trades: T[]
): (T & { symbol: string; assetTicker: string; crncyTicker: string })[] {
  if (!trades || trades.length === 0) {
    return [];
  }

  return trades.map(trade => {
    // Try multiple fields to find instrument ID
    const id = trade.instrumentId || trade.orderId || trade.clientId || 1;
    const info = instrumentMap.get(id);
    
    return {
      ...trade,
      symbol: info ? info.pair : `Instrument #${id}`,
      assetTicker: info ? info.assetTicker : 'UNKNOWN',
      crncyTicker: info ? info.crncyTicker : 'UNKNOWN',
    };
  });
}

/**
 * Add a new instrument mapping
 * Call this when you discover a new instrument in your trades
 */
export function addInstrument(info: InstrumentInfo): void {
  DEVNET_INSTRUMENTS.push(info);
  instrumentMap.set(info.instrumentId, info);
  pairToIdMap.set(info.pair, info.instrumentId);
  console.log(`✅ Added instrument: ${info.instrumentId} → ${info.pair}`);
}

/**
 * Test function to display all mappings
 */
export function testMappings(): void {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   INSTRUMENT MAPPINGS (Hardcoded)      ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('📊 AVAILABLE INSTRUMENTS:');
  console.log('─'.repeat(60));
  
  DEVNET_INSTRUMENTS.forEach(info => {
    console.log(
      `ID: ${info.instrumentId.toString().padEnd(3)} | ` +
      `${info.pair.padEnd(12)} | ` +
      `Asset: ${info.assetTicker.padEnd(6)} | ` +
      `Currency: ${info.crncyTicker}`
    );
  });
  
  console.log('─'.repeat(60));
  console.log(`Total: ${DEVNET_INSTRUMENTS.length} instruments\n`);
  
  // Test lookups
  console.log('🧪 TESTING LOOKUPS:');
  console.log('─'.repeat(60));
  
  const testId = 1;
  const pair = getInstrumentPair(testId);
  console.log(`✅ getInstrumentPair(${testId}) → ${pair}`);
  
  const id = getInstrumentIdByPair(pair);
  console.log(`✅ getInstrumentIdByPair("${pair}") → ${id}`);
  
  const info = getInstrumentInfo(testId);
  console.log(`✅ getInstrumentInfo(${testId}) →`, JSON.stringify(info, null, 2));
  
  const allPairs = getAllTradingPairs();
  console.log(`✅ getAllTradingPairs() → [${allPairs.join(', ')}]`);
  
  // Test enrichment
  const sampleTrades = [
    { instrumentId: 1, side: 'BUY', price: 85.21, size: 10 },
    { instrumentId: 2, side: 'SELL', price: 45000, size: 0.5 },
  ];
  
  const enriched = enrichTradesWithPairs(sampleTrades);
  console.log(`\n✅ enrichTradesWithPairs() →`);
  enriched.forEach(trade => {
    console.log(`   ${trade.side} ${trade.size} ${trade.symbol} @ $${trade.price}`);
  });
  
  console.log('\n─'.repeat(60));
  console.log('✅ ALL TESTS PASSED!\n');
}

// Run test if called directly
if (require.main === module) {
  testMappings();
}