/**
 * Test Script - Verify Deriverse Integration
 * Run this to test if everything works correctly
 */

import { fetchAllTrades, hasTradingActivity } from './lib-utils';

// Your wallet address
const TEST_WALLET = "FK4ugTURYRR2hbSDZr1Q1kqU4xX4UQP7o28cr3wUpG2q";

async function testIntegration() {
  console.log('='.repeat(60));
  console.log('DERIVERSE INTEGRATION TEST');
  console.log('='.repeat(60));
  
  // Test 1: Check if account exists
  console.log('\n📋 TEST 1: Check Account Exists\n');
  const hasAccount = await hasTradingActivity(TEST_WALLET);
  
  if (!hasAccount) {
    console.log('\n⚠️  No Deriverse account found!');
    console.log('Make sure you have traded on Deriverse first.');
    return;
  }
  
  // Test 2: Fetch all trading data
  console.log('\n📋 TEST 2: Fetch All Trading Data\n');
  const allData = await fetchAllTrades(TEST_WALLET);
  
  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  
  console.log('\n📊 SPOT INFO:');
  console.log(JSON.stringify(allData.spotInfo ?? null, null, 2));
  
  console.log('\n📊 PERP INFO:');
  console.log(JSON.stringify(allData.perpInfo ?? null, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(60));
}

// Run the test
testIntegration().catch(error => {
  console.error('\n❌ TEST FAILED:', error);
  process.exit(1);
});
