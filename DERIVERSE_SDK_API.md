# Deriverse SDK API Reference

This document provides an overview of available methods and functions in the `@deriverse/kit` package.

## Core Engine Class

### Constructor
```typescript
new Engine(rpc: Rpc<any>, args?: EngineArgs)
```

**EngineArgs:**
- `programId?: Address<any>` - Program ID (defaults to mainnet program)
- `version?: number` - Program version (default: 1)
- `commitment?: Commitment` - RPC commitment level
- `uiNumbers?: boolean` - Format numbers for UI display

### Initialization & Setup

#### `initialize(): Promise<boolean>`
Initializes the engine by fetching root state and community data. Required before most operations.

#### `setSigner(signer: Address<any>): Promise<void>`
Sets the client wallet address for operations. Must be called after `initialize()`.

#### `logsDecode(data: readonly string[]): LogMessage[]`
**Key method for fetching transaction history!** Decodes transaction log messages into structured report models. Works without initialization.

**Returns:** Array of log report models (see Log Types below)

**Example:**
```javascript
const reports = engine.logsDecode(tx.meta.logMessages);
reports.forEach(report => {
  if (report instanceof SpotFillOrderReportModel) {
    // Handle spot trade
  }
});
```

---

## Client Data Methods

### `getClientData(): Promise<GetClientDataResponse>`
Gets all client account data including balances, positions, and client IDs.

**Returns:**
- `spotClientIds: Map<number, number>` - Spot client IDs per instrument
- `perpClientIds: Map<number, number>` - Perp client IDs per instrument
- `spotBalances: Map<number, number>` - Spot balances per token
- `perpBalances: Map<number, PerpBalance>` - Perp balances per instrument
- And more...

### `getClientSpotOrdersInfo(args: GetClientSpotOrdersInfoArgs): Promise<GetClientSpotOrdersInfoResponse>`
Gets general information about open spot orders for a specific instrument.

**Args:**
- `instrId: number` - Instrument ID
- `clientId: number` - Client ID (from `getClientData()`)

**Returns:**
- `bidsCount`, `asksCount` - Number of open orders
- `tempAssetTokens`, `tempCrncyTokens` - Temporary balances
- `inOrdersAssetTokens`, `inOrdersCrncyTokens` - Tokens locked in orders

### `getClientPerpOrdersInfo(args: GetClientPerpOrdersInfoArgs): Promise<GetClientPerpOrdersInfoResponse>`
Gets general information about open perpetual orders for a specific instrument.

**Returns:**
- `perps`, `funds` - Margin account balances
- `fees`, `rebates`, `fundingFunds`, `socLossFunds` - Statistics
- `result` - Realized PnL
- `cost` - Position cost
- `mask` - Leverage level and other info

### `getClientSpotOrders(args: GetClientSpotOrdersArgs): Promise<GetClientSpotOrdersResponse>`
Gets detailed list of open spot orders.

### `getClientPerpOrders(args: GetClientPerpOrdersArgs): Promise<GetClientPerpOrdersResponse>`
Gets detailed list of open perpetual orders.

---

## Market Data Methods

### `updateInstrData(args: InstrId): Promise<void>`
Updates market data (orderbook, prices) for an instrument.

### `updateInstrDataFromBuffer(data: Base64EncodedDataResponse): Promise<void>`
Updates market data from account buffer (useful for subscriptions).

### `instrLut(args: InstrId): Address`
Gets AddressLookupTable for compiling versioned transactions.

### `getSpotCandles(instrAccountHeaderModel: InstrAccountHeaderModel): Promise<IAccountMeta[]>`
Gets spot candle data accounts.

---

## Token & Instrument Methods

### `getTokenId(mint: Address): Promise<number | null>`
Gets token ID from mint address.

### `getInstrId(args: GetInstrIdArgs): Promise<number | null>`
Gets instrument ID from base currency and asset token IDs.

### `getAccountByTag(tag: number): Promise<Address>`
Gets account address by account type tag.

### `getInstrAccountByTag(args: getInstrAccountByTagArgs): Promise<Address>`
Gets instrument account address by tag.

### `addToken(tokenAccount: Address): Promise<void>`
Adds a token to the engine's token map.

### `addInstr(instrAccount: Address): Promise<void>`
Adds an instrument to the engine's instrument map.

---

## Instruction Building Methods

### Spot Trading
- `newSpotOrderInstruction(args: NewSpotOrderArgs)` - Create new spot order
- `spotQuotesReplaceInstruction(args: SpotQuotesReplaceArgs)` - Replace quotes
- `spotOrderCancelInstruction(args: SpotOrderCancelArgs)` - Cancel order
- `spotMassCancelInstruction(args: SpotMassCancelArgs)` - Mass cancel
- `spotLpInstruction(args: SpotLpArgs)` - LP trading

### Perpetual Trading
- `newPerpOrderInstruction(args: NewPerpOrderArgs)` - Create new perp order
- `perpQuotesReplaceInstruction(args: PerpQuotesReplaceArgs)` - Replace quotes
- `perpOrderCancelInstruction(args: PerpOrderCancelArgs)` - Cancel order
- `perpMassCancelInstruction(args: PerpMassCancelArgs)` - Mass cancel
- `perpChangeLeverageInstruction(args: PerpChangeLeverageArgs)` - Change leverage
- `perpBuySeatInstruction(args: PerpBuySeatArgs)` - Buy market seat
- `perpSellSeatInstruction(args: PerpSellSeatArgs)` - Sell market seat

### Deposits & Withdrawals
- `depositInstruction(args: DepositArgs)` - Deposit spot tokens
- `withdrawInstruction(args: WithdrawArgs)` - Withdraw spot tokens
- `perpDepositInstruction(args: PerpDepositArgs)` - Deposit perp margin
- (Perp withdrawals handled via perp instructions)

### Other
- `swapInstruction(args: SwapArgs)` - Direct swap
- `newInstrumentInstructions(args: NewInstrumentArgs)` - Create new instrument
- `upgradeToPerpInstructions(args: InstrId)` - Upgrade spot to perp
- `newRefLinkInstruction()` - Create referral link

---

## Log Types & Report Models

The `logsDecode()` method returns an array of `LogMessage` types. Here are the available report models:

### Trade Reports (Most Important for History)
- **`SpotFillOrderReportModel`** - Spot trade execution
  - Properties: `side`, `clientId`, `orderId`, `qty`, `crncy`, `price`, `rebates`
  
- **`PerpFillOrderReportModel`** - Perpetual trade execution
  - Properties: `side`, `clientId`, `orderId`, `perps`, `crncy`, `price`, `rebates`

### Order Reports
- `SpotPlaceOrderReportModel` - Spot order placed
- `PerpPlaceOrderReportModel` - Perp order placed
- `SpotNewOrderReportModel` - Spot order added to book
- `PerpNewOrderReportModel` - Perp order added to book
- `SpotOrderCancelReportModel` - Spot order cancelled
- `PerpOrderCancelReportModel` - Perp order cancelled
- `SpotOrderRevokeReportModel` - Spot order revoked
- `PerpOrderRevokeReportModel` - Perp order revoked
- `SpotMassCancelReportModel` - Spot mass cancel
- `PerpMassCancelReportModel` - Perp mass cancel

### Deposit/Withdrawal Reports
- `DepositReportModel` - Spot deposit
- `WithdrawReportModel` - Spot withdrawal
- `PerpDepositReportModel` - Perp deposit
- `PerpWithdrawReportModel` - Perp withdrawal
- `FeesDepositReportModel` - Fees deposited
- `FeesWithdrawReportModel` - Fees withdrawn

### Other Reports
- `SpotlpTradeReportModel` - LP token trade
- `PerpFundingReportModel` - Funding rate payment
- `PerpSocLossReportModel` - Socialized loss
- `PerpChangeLeverageReportModel` - Leverage change
- `SpotFeesReportModel` - Spot fees
- `PerpFeesReportModel` - Perp fees
- `EarningsReportModel` - Earnings
- `DrvsAirdropReportModel` - DRVS airdrop
- `BuyMarketSeatReportModel` - Buy market seat
- `SellMarketSeatReportModel` - Sell market seat
- `SwapOrderReportModel` - Swap order
- `MoveSpotAvailFundsReportModel` - Move spot funds

### LogType Enum
```typescript
enum LogType {
  deposit = 1,
  withdraw = 2,
  perpDeposit = 3,
  perpWithdraw = 4,
  feesDeposit = 5,
  feesWithdraw = 6,
  spotLpTrade = 7,
  earnings = 8,
  drvsAirdrop = 9,
  spotPlaceOrder = 10,
  spotFillOrder = 11,      // ⭐ Trade execution
  spotNewOrder = 12,
  spotOrderCancel = 13,
  spotOrderRevoke = 14,
  spotFees = 15,
  spotPlaceMassCancel = 16,
  spotMassCancel = 17,
  perpPlaceOrder = 18,
  perpFillOrder = 19,      // ⭐ Trade execution
  perpNewOrder = 20,
  perpOrderCancel = 21,
  perpOrderRevoke = 22,
  perpFees = 23,
  perpFunding = 24,
  perpPlaceMassCancel = 25,
  perpMassCancel = 26,
  perpSocLoss = 27,
  perpChangeLeverage = 28,
  buyMarketSeat = 29,
  sellMarketSeat = 30,
  swapOrder = 31,
  moveSpot = 32,
  newPrivateClient = 33
}
```

---

## Utility Functions

### `getSpotPriceStep(price: number): number`
Calculates price step for spot orderbook based on current price.

### `getPerpPriceStep(price: number): number`
Calculates price step for perp orderbook based on current price.

---

## Usage Example for Transaction History

```javascript
const { Engine, SpotFillOrderReportModel, PerpFillOrderReportModel } = require("@deriverse/kit");
const { createSolanaRpc, address, devnet } = require("@solana/kit");

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const engine = new Engine(rpc, {
  programId: address("Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu"),
  version: 12
});

// Get transactions
const signatures = await rpc.getSignaturesForAddress(
  address("YOUR_WALLET_ADDRESS"),
  { limit: 50 }
).send();

// Decode logs from each transaction
for (const sigInfo of signatures) {
  const tx = await rpc.getTransaction(sigInfo.signature, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
    encoding: 'jsonParsed'
  }).send();

  if (tx?.meta?.logMessages) {
    try {
      const reports = engine.logsDecode(tx.meta.logMessages);
      
      for (const report of reports) {
        if (report instanceof SpotFillOrderReportModel) {
          console.log('Spot Trade:', {
            side: report.side === 0 ? 'BUY' : 'SELL',
            price: report.price,
            qty: report.qty,
            crncy: report.crncy,
            orderId: report.orderId,
            clientId: report.clientId
          });
        } else if (report instanceof PerpFillOrderReportModel) {
          console.log('Perp Trade:', {
            side: report.side === 0 ? 'BUY' : 'SELL',
            price: report.price,
            perps: report.perps,
            crncy: report.crncy,
            orderId: report.orderId,
            clientId: report.clientId
          });
        }
      }
    } catch (err) {
      // Not a Deriverse transaction or version mismatch
      continue;
    }
  }
}
```

---

## Notes

1. **Initialization**: `logsDecode()` works **without** calling `initialize()`, making it perfect for fetching historical data.

2. **Version Mismatch**: If `initialize()` fails due to SDK/program version mismatch, you can still use `logsDecode()` to parse transaction logs.

3. **Client Data**: To get current positions and open orders, you need to:
   - Call `initialize()`
   - Call `setSigner(walletAddress)`
   - Call `getClientData()`
   - Then use the client IDs to query orders

4. **Transaction History**: The most reliable way to get trade history is:
   - Fetch transactions using Solana RPC
   - Use `logsDecode()` on transaction logs
   - Filter for `SpotFillOrderReportModel` and `PerpFillOrderReportModel`

5. **All Report Models**: All report models have a `tag` property that corresponds to `LogType` enum values.
