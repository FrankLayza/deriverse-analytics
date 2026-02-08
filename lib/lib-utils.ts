/**
 * Deriverse Trading Data Utilities - CORRECTED
 * Each function returns data that can be easily console.logged
 */

import { createRpcFromConfig, getEngine, getPreferredNetworkConfig } from './lib-engine';
import { address } from '@solana/kit';
import {
  Engine,
  PerpFillOrderReportModel,
  SpotFillOrderReportModel,
  type GetClientPerpOrdersInfoResponse,
  type GetClientSpotOrdersInfoResponse,
} from '@deriverse/kit';

async function hasDeriverseLogs(walletAddress: string): Promise<boolean> {
  const cfg = getPreferredNetworkConfig();
  const rpc = createRpcFromConfig(cfg);
  const engine = new Engine(rpc, {
    programId: address(cfg.programId),
    version: cfg.version,
    commitment: 'confirmed',
  });

  const limit = Number(
    process.env.DERIVERSE_ACTIVITY_LIMIT || process.env.TRADE_HISTORY_LIMIT || '50'
  );

  const signatures = await rpc
    .getSignaturesForAddress(address(walletAddress), { limit })
    .send();

  for (const sigInfo of signatures) {
    const tx = await rpc
      .getTransaction(sigInfo.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
        encoding: 'jsonParsed'
      })
      .send();

    const logs = tx?.meta?.logMessages;
    if (!logs || logs.length === 0) continue;

    let reports;
    try {
      reports = engine.logsDecode(logs);
    } catch {
      continue;
    }

    if (!reports || reports.length === 0) continue;

    const hasFills = reports.some(
      report =>
        report instanceof SpotFillOrderReportModel ||
        report instanceof PerpFillOrderReportModel
    );

    if (hasFills || reports.length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Fetch spot trading orders for a wallet
 * 
 * @param walletAddress - Solana wallet address as string
 * @returns Array of spot orders
 */
export async function fetchSpotOrders(walletAddress: string) {
  console.log(`?? Fetching spot orders for: ${walletAddress}`);
  
  try {
    const engine = await getEngine();
    await engine.setSigner(address(walletAddress));
    
    // getClientSpotOrdersInfo requires instrId + clientId
    const clientData = await engine.getClientData();
    
    console.log('Client data:', clientData);
    
    const spotInfos: Array<{
      instrId: number;
      info: GetClientSpotOrdersInfoResponse;
    }> = [];
    for (const spotData of clientData.spot.values()) {
      const info = await engine.getClientSpotOrdersInfo({
        instrId: spotData.instrId,
        clientId: spotData.clientId,
      });
      spotInfos.push({ instrId: spotData.instrId, info });
    }
    
    console.log(`? Spot orders info fetched`);
    return spotInfos;
    
  } catch (error) {
    console.error('? Error fetching spot orders:', error);
    return null;
  }
}

/**
 * Fetch perpetual trading orders for a wallet
 * 
 * @param walletAddress - Solana wallet address as string
 * @returns Array of perpetual orders
 */
export async function fetchPerpOrders(walletAddress: string) {
  console.log(`?? Fetching perp orders for: ${walletAddress}`);
  
  try {
    const engine = await getEngine();
    await engine.setSigner(address(walletAddress));
    
    const clientData = await engine.getClientData();
    const perpInfos: Array<{
      instrId: number;
      info: GetClientPerpOrdersInfoResponse;
    }> = [];
    for (const perpData of clientData.perp.values()) {
      const info = await engine.getClientPerpOrdersInfo({
        instrId: perpData.instrId,
        clientId: perpData.clientId,
      });
      perpInfos.push({ instrId: perpData.instrId, info });
    }
    
    console.log(`? Perp orders info fetched`);
    return perpInfos;
    
  } catch (error) {
    console.error('? Error fetching perp orders:', error);
    return null;
  }
}

/**
 * Fetch ALL trading data for a wallet (using Info methods)
 * 
 * @param walletAddress - Solana wallet address as string
 * @returns Object containing all trading data
 */
export async function fetchAllTrades(walletAddress: string) {
  console.log(`\n?? Fetching ALL trading data for: ${walletAddress}\n`);
  
  try {
    const engine = await getEngine();
    await engine.setSigner(address(walletAddress));
    
    // Get client data first
    const clientData = await engine.getClientData();
    console.log('? Client data fetched');
    
    // Get spot orders info
    const spotInfo: Array<{
      instrId: number;
      info: GetClientSpotOrdersInfoResponse;
    }> = [];
    for (const spotData of clientData.spot.values()) {
      const info = await engine.getClientSpotOrdersInfo({
        instrId: spotData.instrId,
        clientId: spotData.clientId,
      });
      spotInfo.push({ instrId: spotData.instrId, info });
    }
    console.log('? Spot orders info fetched');
    
    // Get perp orders info  
    const perpInfo: Array<{
      instrId: number;
      info: GetClientPerpOrdersInfoResponse;
    }> = [];
    for (const perpData of clientData.perp.values()) {
      const info = await engine.getClientPerpOrdersInfo({
        instrId: perpData.instrId,
        clientId: perpData.clientId,
      });
      perpInfo.push({ instrId: perpData.instrId, info });
    }
    console.log('? Perp orders info fetched');
    
    const result = {
      walletAddress,
      timestamp: new Date().toISOString(),
      clientData,
      spotInfo,
      perpInfo,
    };
    
    console.log(`\n? SUMMARY:`);
    console.log(`   Client Data: ${clientData ? 'Available' : 'Not found'}`);
    console.log(`   Spot Info: ${spotInfo ? 'Available' : 'Not found'}`);
    console.log(`   Perp Info: ${perpInfo ? 'Available' : 'Not found'}\n`);
    
    return result;
    
  } catch (error) {
    console.error('? Error fetching trading data:', error);
    return {
      walletAddress,
      timestamp: new Date().toISOString(),
      clientData: null,
      spotInfo: null,
      perpInfo: null,
      error: (error as Error).message,
    };
  }
}

/**
 * Check if wallet has any Deriverse trading activity
 * 
 * @param walletAddress - Solana wallet address as string
 * @returns Boolean indicating if wallet has trades
 */
export async function hasTradingActivity(walletAddress: string): Promise<boolean> {
  console.log(`?? Checking if wallet has trading activity...`);
  
  try {
    const preferLogsFirst = (process.env.DERIVERSE_ACTIVITY_MODE || '').toLowerCase() !== 'engine-first';

    if (preferLogsFirst) {
      const hasLogs = await hasDeriverseLogs(walletAddress);
      console.log(`${hasLogs ? '?' : '?'} Has Deriverse logs: ${hasLogs}`);
      if (hasLogs) {
        return true;
      }
    }

    const engine = await getEngine();
    await engine.setSigner(address(walletAddress));
    const clientData = await engine.getClientData();
    const hasActivity =
      clientData.spot.size > 0 || clientData.perp.size > 0 || clientData.lp.size > 0;
    
    console.log(`${hasActivity ? '?' : '?'} Has Deriverse account: ${hasActivity}`);
    return hasActivity;
    
  } catch (error) {
    console.warn('? Error checking account via client data, falling back to log scan:', error);
    try {
      const hasLogs = await hasDeriverseLogs(walletAddress);
      console.log(`${hasLogs ? '?' : '?'} Has Deriverse logs: ${hasLogs}`);
      return hasLogs;
    } catch (scanError) {
      console.error('? Error checking account:', scanError);
      return false;
    }
  }
}

/**
 * Get client account data
 * 
 * @param walletAddress - Solana wallet address as string
 * @returns Client account data
 */
export async function fetchClientData(walletAddress: string) {
  console.log(`?? Fetching client data for: ${walletAddress}`);
  
  try {
    const engine = await getEngine();
    await engine.setSigner(address(walletAddress));
    
    const clientData = await engine.getClientData();
    
    console.log(`? Client data fetched`);
    console.log('Client data structure:', JSON.stringify(clientData, null, 2));
    
    return clientData;
    
  } catch (error) {
    console.error('? Error fetching client data:', error);
    return null;
  }
}
