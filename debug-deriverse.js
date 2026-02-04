/**
 * Debug script to explore Deriverse SDK Engine class with Solana Kit
 */

const { Engine, PROGRAM_ID } = require('@deriverse/kit');
const { Connection } = require('@solana/kit');

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

console.log('='.repeat(80));
console.log('DERIVERSE KIT + SOLANA/KIT EXPLORATION');
console.log('='.repeat(80));

// First, let's explore what solana/kit provides
console.log('\n1. SOLANA/KIT EXPORTS:');
try {
  const solanaKitExports = require('@solana/kit');
  console.log('Total exports:', Object.keys(solanaKitExports).length);
  console.log('Key exports:', Object.keys(solanaKitExports).slice(0, 20));
} catch (error) {
  console.log('Error loading solana/kit:', error.message);
}

console.log('\n2. CREATING ENGINE WITH SOLANA/KIT CONNECTION:');
try {
  const engine = new Engine({
    connection,
    programId: PROGRAM_ID,
  });

  console.log('✓ Engine created successfully with solana/kit connection!');
  console.log('Engine type:', typeof engine);
  console.log('Engine constructor:', engine.constructor.name);
  
  // Verify the connection works
  console.log('\n3. TESTING CONNECTION:');
  console.log('Connection endpoint:', connection.rpcEndpoint);
  console.log('Connection type:', connection.constructor.name);
  
  // Check if connection has expected methods
  const connectionMethods = ['getAccountInfo', 'getBalance', 'sendTransaction'];
  for (const method of connectionMethods) {
    console.log(`  connection.${method}:`, typeof connection[method] === 'function' ? '✓' : '✗');
  }
  
  console.log('\n4. ENGINE INSTANCE EXPLORATION:');
  
  // Get all properties and methods
  const instanceProps = Object.keys(engine);
  const prototype = Object.getPrototypeOf(engine);
  const prototypeMethods = Object.getOwnPropertyNames(prototype).filter(
    name => typeof prototype[name] === 'function' && name !== 'constructor'
  );
  
  console.log(`Instance properties: ${instanceProps.length}`);
  console.log(`Prototype methods: ${prototypeMethods.length}`);
  
  console.log('\n5. CATEGORIZED ENGINE METHODS:');
  
  // Categorize methods by likely functionality
  const categorized = {
    account: [],
    market: [],
    order: [],
    trade: [],
    subscription: [],
    utility: [],
    other: []
  };
  
  const allMethods = [...prototypeMethods];
  
  allMethods.forEach(method => {
    const lowerMethod = method.toLowerCase();
    
    if (lowerMethod.includes('account')) {
      categorized.account.push(method);
    } else if (lowerMethod.includes('market')) {
      categorized.market.push(method);
    } else if (lowerMethod.includes('order')) {
      categorized.order.push(method);
    } else if (lowerMethod.includes('trade')) {
      categorized.trade.push(method);
    } else if (lowerMethod.includes('subscribe') || lowerMethod.includes('on') || lowerMethod.includes('event')) {
      categorized.subscription.push(method);
    } else if (lowerMethod.includes('get') || lowerMethod.includes('fetch') || lowerMethod.includes('load')) {
      categorized.utility.push(method);
    } else {
      categorized.other.push(method);
    }
  });
  
  for (const [category, methods] of Object.entries(categorized)) {
    if (methods.length > 0) {
      console.log(`\n  ${category.toUpperCase()}:`);
      console.log(`    ${methods.slice(0, 10).join(', ')}${methods.length > 10 ? `... (+${methods.length - 10} more)` : ''}`);
    }
  }
  
  console.log('\n6. TESTING KEY ENGINE METHODS:');
  
  // Test methods that should work without arguments
  const testMethods = [
    'getVersion',
    'version',
    'getProgramId',
    'programId',
    'getConnection',
    'connection'
  ];
  
  for (const method of testMethods) {
    try {
      if (typeof engine[method] === 'function') {
        const result = engine[method]();
        console.log(`  ✓ engine.${method}() =`, typeof result === 'object' ? result.constructor.name : result);
      } else if (engine[method] !== undefined) {
        console.log(`  - engine.${method} =`, engine[method]);
      }
    } catch (error) {
      console.log(`  ✗ engine.${method}: ${error.message}`);
    }
  }
  
  console.log('\n7. QUICK FUNCTION SIGNATURE SAMPLES:');
  // Show a few method signatures
  for (const method of prototypeMethods.slice(0, 5)) {
    try {
      const func = prototype[method];
      const args = func.length;
      console.log(`  ${method}(${'arg'.repeat(args).split('').join(', ')})`);
    } catch (e) {
      // Skip if we can't inspect
    }
  }
  
  console.log('\n8. CHECKING FOR DERIVERSE-SPECIFIC METHODS:');
  
  // Based on the report models, look for related methods
  const reportModelToMethod = {
    'UserAccount': ['getUser', 'getAccount', 'fetchUser'],
    'Deposit': ['deposit', 'createDeposit'],
    'Withdraw': ['withdraw', 'createWithdraw'],
    'Order': ['placeOrder', 'cancelOrder', 'getOrder'],
    'Trade': ['getTrade', 'getTrades', 'tradeHistory'],
    'Market': ['getMarket', 'markets', 'marketInfo'],
    'Perp': ['perp', 'perpetual', 'leverage'],
    'Spot': ['spot', 'swap']
  };
  
  for (const [pattern, methodNames] of Object.entries(reportModelToMethod)) {
    const matches = allMethods.filter(method => 
      methodNames.some(name => method.toLowerCase().includes(name.toLowerCase())) ||
      method.toLowerCase().includes(pattern.toLowerCase())
    );
    if (matches.length > 0) {
      console.log(`  ${pattern}: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
    }
  }
  
} catch (error) {
  console.log('Error creating Engine:', error.message);
  console.log('Error stack:', error.stack?.split('\n')[0]);
}

console.log('\n9. DERIVERSE CONSTANTS:');
console.log('  PROGRAM_ID:', PROGRAM_ID ? PROGRAM_ID.toString() : 'Not found');
console.log('  VERSION:', require('@deriverse/kit').VERSION || 'Not found');

console.log('\n' + '='.repeat(80));
console.log('USAGE EXAMPLES WITH SOLANA/KIT:');
console.log('='.repeat(80));
console.log(`
// Basic setup:
const { Engine, PROGRAM_ID } = require('@deriverse/kit');
const { Connection } = require('@solana/kit');

const connection = new Connection('https://api.devnet.solana.com');
const engine = new Engine({
  connection,
  programId: PROGRAM_ID,
});

// Likely methods to try:
// 1. engine.getUserAccount(publicKey)
// 2. engine.getMarkets()
// 3. engine.getSpotPrice(marketId)
// 4. engine.placeOrder({...})
// 5. engine.subscribeToEvents(callback)
`);

console.log('\n' + '='.repeat(80));
console.log('TROUBLESHOOTING:');
console.log('='.repeat(80));
console.log(`
If methods aren't found:
1. Check the actual method names from the debug output
2. Look for documentation in the Deriverse repository
3. Try common patterns: getUserAccount, fetchUser, getAccountInfo
4. Check if methods are async (use await)
5. Verify programId is correct for your network
`);

console.log('\n' + '='.repeat(80));
console.log('Run the script to see available methods, then try calling them!');
console.log('='.repeat(80));