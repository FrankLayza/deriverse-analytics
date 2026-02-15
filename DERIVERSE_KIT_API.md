# Deriverse Kit SDK API Documentation

> **Package:** `@deriverse/kit` v1.0.40 (ESM, Apache-2.0)  
> **Dependencies:** `@solana/kit ^6.0.1`, `@solana-program/system ^0.11.0`, `bs58 ^6.0.0`, `zod ^4.3.6`

This document outlines all available functions, methods, and types from the `@deriverse/kit` package that can be used to build a comprehensive trading analytics dashboard.

## Table of Contents
1. [Engine Class](#engine-class)
2. [Utility Functions](#utility-functions)
3. [Types & Interfaces](#types--interfaces)
4. [Log Models & Event Types](#log-models--event-types)
5. [Structure Models](#structure-models)
6. [Enums](#enums)
7. [Zod Validation Schemas](#zod-validation-schemas)
8. [Instruction Builder Functions](#instruction-builder-functions)
9. [Usage Examples](#usage-examples)

---

## Engine Class

The `Engine` class is the main interface for interacting with the Deriverse protocol. It handles blockchain data fetching, log decoding, order management, and position tracking.

### Constructor

```typescript
constructor(rpc: Rpc<any>, args?: EngineArgs)
```

**Parameters:**
- `rpc`: Solana RPC connection from `@solana/kit`
- `args` (optional): Engine configuration
  ```typescript
  {
    programId?: Address<any>;
    version?: number;
    commitment?: Commitment;
    uiNumbers?: boolean;
  }
  ```

### Properties

- `programId`: Address<any> - Deriverse program ID
- `rootStateModel`: RootStateModel - Root state data
- `community`: CommunityData - Community account data
- `tokens`: Map<number, TokenStateModel> - Registered tokens
- `instruments`: Map<number, Instrument> - Trading instruments
- `version`: number - Engine version
- `commitment`: Commitment - RPC commitment level

---

## Core Methods

### Initialization & Setup

#### `initialize(): Promise<boolean>`

Initializes the engine by fetching root state and community data. Must be called after engine creation.

**Returns:** `true` if initialization successful

**Use Case:** Required before using any other engine methods.

---

#### `setSigner(signer: Address<any>): Promise<void>`

Assigns client public key to Engine for authenticated operations.

**Parameters:**
- `signer`: Client wallet address

**Use Case:** Required for client-specific operations like fetching orders or placing trades.

---

### Data Fetching & Updates

#### `updateRoot(): Promise<void>`

Updates root state data from blockchain.

**Use Case:** Refresh root protocol state.

---

#### `updateRootFromBuffer(data: Base64EncodedDataResponse): void`

Updates root state from provided buffer data (useful for subscriptions).

**Use Case:** Real-time updates via account subscriptions.

---

#### `updateCommunity(): Promise<void>`

Updates community account data from blockchain.

**Use Case:** Refresh community voting and fee data.

---

#### `updateCommunityFromBuffer(data: Base64EncodedDataResponse): void`

Updates community data from buffer.

**Use Case:** Real-time community updates.

---

#### `updateInstrData(args: InstrId): Promise<void>`

Updates market data for a specific instrument.

**Parameters:**
```typescript
{
  instrId: number;
}
```

**Use Case:** Refresh orderbook, prices, and market statistics for an instrument.

---

#### `updateInstrDataFromBuffer(data: Base64EncodedDataResponse): Promise<void>`

Updates instrument data from buffer (for subscriptions).

**Use Case:** Real-time market data updates.

---

### Log Decoding

#### `logsDecode(data: readonly string[]): LogMessage[]`

Decodes transaction log messages into structured event objects. This is the core method for extracting trade data from blockchain transactions.

**Parameters:**
- `data`: Array of log message strings from Solana transaction

**Returns:** Array of decoded log messages (trade events, deposits, withdrawals, etc.)

**Use Case:**
- Extract trade fills from transaction logs
- Parse deposit/withdrawal events
- Track order placements and cancellations
- Analyze fees and funding payments

**Note:** Returns a union type `LogMessage` which is one of 30 different report model types.

**Example:**
```typescript
const logs = transaction.meta.logMessages;
const decodedEvents = engine.logsDecode(logs);
// Filter for trade events
const fills = decodedEvents.filter(e => 
  e.tag === LogType.spotFillOrder || 
  e.tag === LogType.perpFillOrder
);
```

---

### Client Data & Orders

#### `getClientData(): Promise<GetClientDataResponse>`

Unpacks all client account data including balances, open orders, and statistics.

**Returns:**
```typescript
{
  clientId: number;
  points: number;
  mask: number;
  slot: number;
  spotTrades: number;        // All-time active spot trades count
  lpTrades: number;          // All-time LP trades count
  perpTrades: number;        // All-time active perp trades count
  tokens: Map<number, ClientTokenData>;
  lp: Map<number, ClientLpData>;
  spot: Map<number, ClientSpotData>;
  perp: Map<number, ClientPerpData>;
  refProgram: ClientRefProgramData;
  refLinks: RefLink[];
  community: ClientCommunityData;
}
```

**Use Case:**
- Get total trade counts for analytics
- Fetch token balances
- Check referral program status
- Get client statistics

---

#### `getClientSpotOrdersInfo(args: GetClientSpotOrdersInfoArgs): Promise<GetClientSpotOrdersInfoResponse>`

Gets general information about open spot orders in a particular instrument.

**Parameters:**
```typescript
{
  instrId: number;
  clientId: number;  // From getClientData()
}
```

**Returns:**
```typescript
{
  bidsCount: number;              // Open bid orders count
  asksCount: number;               // Open ask orders count
  bidsEntry: number;               // Entrypoint in bid orders account
  asksEntry: number;               // Entrypoint in ask orders account
  bidSlot: number;                 // Last update slot for bids
  askSlot: number;                 // Last update slot for asks
  contextSlot: number;
  tempAssetTokens: number;         // Available to withdraw
  tempCrncyTokens: number;         // Available to withdraw
  inOrdersAssetTokens: number;     // Locked in orders
  inOrdersCrncyTokens: number;     // Locked in orders
}
```

**Use Case:**
- Count open orders
- Calculate available vs locked balances
- Track order book state

---

#### `getClientSpotOrders(args: GetClientSpotOrdersArgs): Promise<GetClientSpotOrdersResponse>`

Gets detailed list of open spot orders.

**Parameters:**
```typescript
{
  instrId: number;
  bidsCount: number;      // From getClientSpotOrdersInfo()
  asksCount: number;
  bidsEntry: number;
  asksEntry: number;
}
```

**Returns:**
```typescript
{
  contextSlot: number;
  bids: OrderModel[];
  asks: OrderModel[];
}
```

**Use Case:**
- Display open orders table
- Calculate order value
- Track order status

---

#### `getClientPerpOrdersInfo(args: GetClientPerpOrdersInfoArgs): Promise<GetClientPerpOrdersInfoResponse>`

Gets general information about perpetual positions and orders.

**Parameters:**
```typescript
{
  instrId: number;
  clientId: number;  // From getClientData()
}
```

**Returns:**
```typescript
{
  bidsCount: number;
  asksCount: number;
  bidsEntry: number;
  asksEntry: number;
  bidSlot: number;
  askSlot: number;
  contextSlot: number;
  perps: number;              // Margin account perps balance
  funds: number;              // Margin account funds balance
  inOrdersPerps: number;      // Perps in orders
  inOrdersFunds: number;      // Funds in orders
  fees: number;                // Fees statistics
  rebates: number;            // Rebates statistics
  fundingFunds: number;       // Funding rate payments
  socLossFunds: number;       // Socialized losses payments
  result: number;              // Realized PnL statistics
  cost: number;               // Position cost
  mask: number;               // Contains leverage level (first byte)
}
```

**Use Case:**
- Calculate unrealized PnL
- Track funding payments
- Monitor margin account balances
- Analyze fees and rebates
- Get leverage information

---

#### `getClientPerpOrders(args: GetClientPerpOrdersArgs): Promise<GetClientPerpOrdersResponse>`

Gets detailed list of open perpetual orders.

**Parameters:**
```typescript
{
  instrId: number;
  bidsCount: number;
  asksCount: number;
  bidsEntry: number;
  asksEntry: number;
}
```

**Returns:**
```typescript
{
  contextSlot: number;
  bids: OrderModel[];
  asks: OrderModel[];
}
```

**Use Case:** Display open perp orders.

---

### Additional Data Methods

#### `addToken(tokenAccount: Address): Promise<void>`

Manually adds a token to the engine's token registry.

**Parameters:**
- `tokenAccount`: Deriverse token account address

**Use Case:** Register tokens not automatically loaded during initialization.

---

#### `addInstr(instrAccount: Address): Promise<void>`

Manually adds an instrument to the engine's instrument registry.

**Parameters:**
- `instrAccount`: Deriverse instrument account address

**Use Case:** Register instruments not automatically loaded during initialization.

---

#### `instrLut(args: InstrId): Address`

Gets the lookup table address for an instrument.

**Parameters:**
```typescript
{ instrId: number }
```

**Returns:** Address of the instrument's lookup table

---

#### `getTokenAccount(mint: Address): Promise<Address>`

Gets the Deriverse token account address from a mint address.

**Parameters:**
- `mint`: SPL token mint address

**Returns:** Deriverse token account address

---

#### `getSpotContext(instrAccountHeaderModel: InstrAccountHeaderModel): Promise<AccountMeta[]>`

Gets the account context needed for spot trading instructions.

**Use Case:** Build transaction contexts for spot operations.

---

#### `getPerpContext(instrAccountHeaderModel: InstrAccountHeaderModel): Promise<AccountMeta[]>`

Gets the account context needed for perpetual trading instructions.

**Use Case:** Build transaction contexts for perp operations.

---

#### `getSpotCandles(instrAccountHeaderModel: InstrAccountHeaderModel): Promise<AccountMeta[]>`

Gets the account context for spot candle data.

**Use Case:** Access historical candle/OHLCV data for charting.

---

### Instrument & Token Utilities

#### `getTokenId(mint: Address): Promise<number | null>`

Gets Token ID from mint public key if registered on Deriverse.

**Parameters:**
- `mint`: Token mint address

**Returns:** Token ID or `null` if not found

**Use Case:** Convert mint addresses to Deriverse token IDs.

---

#### `getInstrId(args: GetInstrIdArgs): Promise<number | null>`

Gets instrument ID from token IDs.

**Parameters:**
```typescript
{
  assetTokenId: number;
  crncyTokenId: number;
}
```

**Returns:** Instrument ID or `null` if not found

**Use Case:** Find instrument ID for trading pairs.

---

#### `getAccountByTag(tag: number): Promise<Address>`

Gets account address by account type tag.

**Use Case:** Find specific account addresses.

---

#### `getInstrAccountByTag(args: getInstrAccountByTagArgs): Promise<Address>`

Gets instrument account address by tag.

**Parameters:**
```typescript
{
  assetTokenId: number;
  crncyTokenId: number;
  tag: number;  // AccountType enum value
}
```

**Use Case:** Get orderbook, candles, or other instrument account addresses.

---

### Price Utilities

#### `getSpotPriceStep(price: number): number`

Gets price step between orderbook lines for spot markets.

**Parameters:**
- `price`: Current market price

**Returns:** Price step value

**Use Case:** Calculate valid price increments for orders.

---

#### `getPerpPriceStep(price: number): number`

Gets price step between orderbook lines for perpetual markets.

**Use Case:** Calculate valid price increments for perp orders.

---

### Instruction Building (Transaction Creation)

The Engine provides methods to build transaction instructions. These are used to create transactions but are less relevant for analytics. All return `Promise<Instruction>` unless noted.

#### Spot Trading Instructions
- `depositInstruction(args: DepositArgs)`
- `withdrawInstruction(args: WithdrawArgs)`
- `spotLpInstruction(args: SpotLpArgs)`
- `newSpotOrderInstruction(args: NewSpotOrderArgs)`
- `spotQuotesReplaceInstruction(args: SpotQuotesReplaceArgs)`
- `spotOrderCancelInstruction(args: SpotOrderCancelArgs)`
- `spotMassCancelInstruction(args: SpotMassCancelArgs)`
- `swapInstruction(args: SwapArgs)`

#### Perpetual Trading Instructions
- `perpDepositInstruction(args: PerpDepositArgs)`
- `perpBuySeatInstruction(args: PerpBuySeatArgs)`
- `perpSellSeatInstruction(args: PerpSellSeatArgs)`
- `newPerpOrderInstruction(args: NewPerpOrderArgs)`
- `perpQuotesReplaceInstruction(args: PerpQuotesReplaceArgs)`
- `perpOrderCancelInstruction(args: PerpOrderCancelArgs)`
- `perpMassCancelInstruction(args: PerpMassCancelArgs)`
- `perpChangeLeverageInstruction(args: PerpChangeLeverageArgs)`
- `perpStatisticsResetInstruction(args: PerpStatisticsResetArgs)`

#### Multi-Instruction Methods (return `Promise<Instruction[]>`)
- `upgradeToPerpInstructions(args: InstrId)` — Upgrade a spot instrument to also support perps
- `newInstrumentInstructions(args: NewInstrumentArgs)` — Create a new instrument

#### Other Instructions
- `newRefLinkInstruction()` — Create a new referral link (no args needed)

---

## Utility Functions

Exported from the package root alongside the Engine class:

#### `getSpotPriceStep(price: number): number`
Get price step between orderbook lines for spot markets.

#### `getPerpPriceStep(price: number): number`
Get price step between orderbook lines for perpetual markets.

#### `tokenDec(tokens: Map<number, TokenStateModel>, tokenId: number, uiNumbers: boolean): number`
Get token decimal factor for UI number conversion.

#### `perpSeatReserve(activeUsers: number): number`
Calculate the perp seat reserve given the number of active users.

#### `getMultipleSpotOrders(data: Base64EncodedDataResponse, firstEntry: number, clientId: number): OrderModel[]`
Parse multiple spot orders from raw account data.

#### `getMultiplePerpOrders(data: Base64EncodedDataResponse, firstEntry: number, clientId: number): OrderModel[]`
Parse multiple perp orders from raw account data.

#### `findAssociatedTokenAddress(owner: Address, tokenProgramId: Address, mint: Address): Promise<Address>`
Derive the associated token address for a given owner, program, and mint.

#### `getLookupTableAddress(authority: Address, slot: number): Promise<Address>`
Derive the lookup table address for a given authority and slot.

---

## Types & Interfaces

### LogType Enum

Enumeration of all event types that can be decoded from transaction logs.

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
  spotFillOrder = 11,        // ⭐ Key for trade analytics
  spotNewOrder = 12,
  spotOrderCancel = 13,
  spotOrderRevoke = 14,
  spotFees = 15,
  spotPlaceMassCancel = 16,
  spotMassCancel = 17,
  perpPlaceOrder = 18,
  perpFillOrder = 19,       // ⭐ Key for trade analytics
  perpNewOrder = 20,
  perpOrderCancel = 21,
  perpOrderRevoke = 22,
  perpFees = 23,
  perpFunding = 24,         // ⭐ Key for funding payments
  perpPlaceMassCancel = 25,
  perpMassCancel = 26,
  perpSocLoss = 27,         // ⭐ Key for socialized losses
  perpChangeLeverage = 28,
  buyMarketSeat = 29,
  sellMarketSeat = 30,
  swapOrder = 31,
  moveSpot = 32,
  newPrivateClient = 33
}
```

---

### Key Log Models for Analytics

#### SpotFillOrderReportModel

Represents a filled spot trade order.

```typescript
{
  tag: number;              // LogType.spotFillOrder (11)
  side: number;             // 0 = bid (buy), 1 = ask (sell)
  clientId: number;
  orderId: number;
  qty: number;              // Quantity filled
  crncy: number;            // Currency amount
  price: number;            // Fill price
  rebates: number;          // Rebates earned
}
```

**Use Case:**
- Track individual trade executions
- Calculate trade value (qty * price)
- Analyze rebates
- Determine trade direction (buy/sell)

---

#### PerpFillOrderReportModel

Represents a filled perpetual trade order.

```typescript
{
  tag: number;              // LogType.perpFillOrder (19)
  side: number;             // 0 = bid (long), 1 = ask (short)
  clientId: number;
  orderId: number;
  perps: number;            // Perpetual position size
  crncy: number;            // Currency amount
  price: number;           // Fill price
  rebates: number;          // Rebates earned
}
```

**Use Case:**
- Track perp trade executions
- Calculate position size changes
- Analyze perp-specific metrics

---

#### PerpFundingReportModel

Represents a funding rate payment for perpetual positions.

```typescript
{
  tag: number;              // LogType.perpFunding (24)
  clientId: number;
  instrId: number;
  time: number;             // Timestamp
  funding: number;          // Funding payment amount (positive = received, negative = paid)
}
```

**Use Case:**
- Track funding costs/income
- Calculate total funding payments over time
- Analyze funding impact on PnL

---

#### PerpSocLossReportModel

Represents socialized loss payment for perpetual positions.

```typescript
{
  tag: number;              // LogType.perpSocLoss (27)
  clientId: number;
  instrId: number;
  time: number;
  socLoss: number;         // Socialized loss amount
}
```

**Use Case:**
- Track socialized loss costs
- Include in total cost analysis

---

#### SpotFeesReportModel / PerpFeesReportModel

Represents fee payments.

```typescript
{
  tag: number;
  refClientId: number;      // Referral client ID (if applicable)
  fees: number;             // Total fees paid
  refPayment: number;       // Referral payment portion
}
```

**Use Case:**
- Track total fees paid
- Calculate net fees after rebates
- Analyze referral program impact

---

#### SpotlpTradeReportModel

Represents a liquidity provider trade on spot markets.

```typescript
{
  tag: number;              // LogType.spotLpTrade (7)
  side: number;
  clientId: number;
  time: number;
  instrId: number;
  orderId: number;
  qty: number;
  tokens: number;
  crncy: number;
}
```

---

#### EarningsReportModel

Represents earnings (dividends/rewards).

```typescript
{
  tag: number;              // LogType.earnings (8)
  clientId: number;
  tokenId: number;
  time: number;
  amount: number;
}
```

---

#### DrvsAirdropReportModel

Represents a DRVS token airdrop.

```typescript
{
  tag: number;              // LogType.drvsAirdrop (9)
  clientId: number;
  amount: number;
  time: number;
}
```

---

#### SpotPlaceOrderReportModel / PerpPlaceOrderReportModel

Represents an order placement event.

```typescript
// Spot
{
  tag: number;              // LogType.spotPlaceOrder (10)
  ioc: number;              // Immediate-or-cancel flag
  side: number;
  orderType: number;        // OrderType enum
  clientId: number;
  orderId: number;
  qty: number;
  price: number;
  instrId: number;
  time: number;
}
// Perp adds: leverage: number
```

---

#### SpotNewOrderReportModel / PerpNewOrderReportModel

Represents a resting order being added to the book.

```typescript
{
  tag: number;              // LogType.spotNewOrder (12) / perpNewOrder (20)
  side: number;
  qty: number;              // or perps for perp
  crncy: number;
}
```

---

#### SpotOrderCancelReportModel / PerpOrderCancelReportModel

Represents an order cancellation.

```typescript
{
  tag: number;
  side: number;
  clientId: number;
  instrId: number;
  time: number;
  orderId: number;
  qty: number;              // or perps for perp
  crncy: number;
}
```

---

#### SpotOrderRevokeReportModel / PerpOrderRevokeReportModel

Represents a forced order revocation.

```typescript
{
  tag: number;
  side: number;
  clientId: number;
  orderId: number;
  qty: number;              // or perps for perp
  crncy: number;
}
```

---

#### SpotMassCancelReportModel / PerpMassCancelReportModel

Represents individual orders cancelled during a mass-cancel.

```typescript
{
  tag: number;
  side: number;
  orderId: number;
  qty: number;              // or perps for perp
  crncy: number;
}
```

---

#### SpotPlaceMassCancelReportModel / PerpPlaceMassCancelReportModel

Represents the initiation of a mass-cancel operation.

```typescript
{
  tag: number;
  clientId: number;
  instrId: number;
  time: number;
}
```

---

#### SwapOrderReportModel

Represents a swap order event.

```typescript
{
  tag: number;              // LogType.swapOrder (31)
  side: number;
  orderType: number;
  orderId: number;
  qty: number;
  price: number;
  time: number;
  instrId: number;
}
```

---

#### BuyMarketSeatReportModel

Represents purchasing a perp market seat.

```typescript
{
  tag: number;              // LogType.buyMarketSeat (29)
  clientId: number;
  instrId: number;
  time: number;
  amount: number;
  seatPrice: number;
}
```

---

#### SellMarketSeatReportModel

Represents selling a perp market seat.

```typescript
{
  tag: number;              // LogType.sellMarketSeat (30)
  clientId: number;
  instrId: number;
  time: number;
  seatPrice: number;
}
```

---

#### PerpDepositReportModel / PerpWithdrawReportModel

Represents perp margin account deposits/withdrawals.

```typescript
{
  tag: number;              // LogType.perpDeposit (3) / perpWithdraw (4)
  clientId: number;
  instrId: number;
  time: number;
  amount: number;
}
```

---

#### FeesDepositReportModel / FeesWithdrawReportModel

Represents fee prepayment deposits/withdrawals.

```typescript
{
  tag: number;              // LogType.feesDeposit (5) / feesWithdraw (6)
  clientId: number;
  tokenId: number;
  time: number;
  amount: number;
}
```

---

#### PerpChangeLeverageReportModel

Represents a leverage change event.

```typescript
{
  tag: number;              // LogType.perpChangeLeverage (28)
  leverage: number;
  clientId: number;
  instrId: number;
  time: number;
}
```

---

#### MoveSpotAvailFundsReportModel

Represents moving available funds from spot temp account.

```typescript
{
  tag: number;              // LogType.moveSpot (32)
  clientId: number;
  instrId: number;
  time: number;
  qty: number;
  crncy: number;
}
```

---

#### DepositReportModel / WithdrawReportModel

Represents deposits and withdrawals.

```typescript
{
  tag: number;
  clientId: number;
  tokenId: number;
  time: number;
  amount: number;
}
```

**Use Case:**
- Track capital flows
- Calculate net deposits
- Analyze funding patterns

---

### Token Interface

```typescript
interface Token {
  account: Address;         // Deriverse account for token data
  mint: Address;            // SPL token mint address
  programAddress: Address;  // SPL token account where tokens are stored
  id: number;               // Deriverse token ID
  decimals: number;
  baseCrncy: boolean;       // True if this is a currency token
  pool: boolean;            // True if this is a pool token
  token2022: boolean;       // True if Token-2022 standard
  mainInstrId?: number;     // Main instrument ID if pool token
}
```

---

### Instrument Interface

```typescript
interface Instrument {
  address: Address;
  header: InstrAccountHeaderModel;
  spotBids: LineQuotesModel[];      // Spot orderbook bids
  spotAsks: LineQuotesModel[];      // Spot orderbook asks
  perpBids: LineQuotesModel[];       // Perp orderbook bids
  perpAsks: LineQuotesModel[];       // Perp orderbook asks
}
```

**Use Case:**
- Access orderbook data
- Calculate bid/ask spreads
- Get market depth

---

### InstrAccountHeaderModel

Contains comprehensive market data for an instrument.

**Key Fields for Analytics:**

**Price Data:**
- `lastPx`: Last trade price (spot)
- `lastClose`: Last close price (spot)
- `bestBid`: Best bid price (spot)
- `bestAsk`: Best ask price (spot)
- `perpLastPx`: Last trade price (perp)
- `perpLastClose`: Last close price (perp)
- `perpBestBid`: Best bid price (perp)
- `perpBestAsk`: Best ask price (perp)

**Volume & Trade Data:**
- `dayTrades`: Daily spot trades count
- `alltimeTrades`: All-time spot trades count
- `perpDayTrades`: Daily perp trades count
- `perpAlltimeTrades`: All-time perp trades count
- `dayAssetTokens`: Daily asset volume
- `dayCrncyTokens`: Daily currency volume
- `alltimeAssetTokens`: All-time asset volume
- `alltimeCrncyTokens`: All-time currency volume

**Perpetual-Specific:**
- `perpOpenInt`: Open interest
- `perpFundingRate`: Current funding rate
- `perpFundingFunds`: Total funding funds
- `perpSocLossFunds`: Total socialized loss funds
- `maxLeverage`: Maximum leverage allowed
- `perpClientsCount`: Number of perp traders

**Use Case:**
- Get current market prices
- Calculate 24h volume
- Track open interest
- Monitor funding rates
- Analyze market statistics

---

### OrderModel

Represents an open order in the orderbook.

```typescript
{
  qty: number;              // Order quantity
  sum: number;              // Cumulative sum
  orderId: number;          // Unique order ID
  origClientId: number;     // Original client ID
  clientId: number;         // Current client ID
  line: number;             // Price line reference
  prev: number;              // Previous order reference
  next: number;              // Next order reference
  time: number;              // Order timestamp
}
```

**Use Case:**
- Display open orders
- Calculate order value
- Track order age

---

### LineQuotesModel

Represents an orderbook price level.

```typescript
{
  px: number;               // Price
  qty: number;              // Total quantity at this price
}
```

**Use Case:**
- Display orderbook depth
- Calculate market depth
- Analyze liquidity

---

### CandleModel

Represents a single candlestick (OHLCV) data point.

```typescript
{
  open: number;
  close: number;
  max: number;              // High
  min: number;              // Low
  assetTokens: number;      // Volume in asset tokens
  crncyTokens: number;      // Volume in currency tokens
  time: number;             // Candle timestamp
  counter: number;
}
```

**Use Case:**
- Build OHLCV charts (1m, 15m, daily candles)
- Calculate technical indicators
- Analyze historical price action

---

### CommunityData

```typescript
interface CommunityData {
  header: CommunityAccountHeaderModel;
  data: Map<number, BaseCrncyRecordModel>;
}
```

---

### ClientCommunityData

```typescript
interface ClientCommunityData {
  header: ClientCommunityAccountHeaderModel;
  data: Map<number, ClientCommunityRecordModel>;
}
```

---

### ClientRefProgramData

```typescript
interface ClientRefProgramData {
  address: Address;         // Referral wallet
  expiration: number;       // Expiration date
  clientId: number;         // Referrer client ID
  discount: number;         // Fee discount
  ratio: number;            // Referral payment share
}
```

---

### GetClientDataResponse

Complete client account data.

```typescript
{
  clientId: number;
  points: number;           // Points for airdrop
  mask: number;
  slot: number;
  spotTrades: number;       // ⭐ All-time active spot trades
  lpTrades: number;          // ⭐ All-time LP trades
  perpTrades: number;       // ⭐ All-time active perp trades
  tokens: Map<number, ClientTokenData>;
  lp: Map<number, ClientLpData>;
  spot: Map<number, ClientSpotData>;
  perp: Map<number, ClientPerpData>;
  refProgram: ClientRefProgramData;
  refLinks: RefLink[];
  community: ClientCommunityData;
}
```

**Use Case:**
- Get total trade counts
- Check token balances
- Track referral status

---

## Usage Examples

### Example 1: Extract Trade Fills from Transaction

```typescript
import { Engine, LogType } from '@deriverse/kit';
import { createSolanaRpc, devnet } from '@solana/kit';

const rpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
const engine = new Engine(rpc);
await engine.initialize();

// Fetch transaction
const tx = await rpc.getTransaction(signature, {
  maxSupportedTransactionVersion: 0
}).send();

// Decode logs
const logs = tx.value.meta.logMessages;
const events = engine.logsDecode(logs);

// Filter for trade fills
const spotFills = events.filter(e => e.tag === LogType.spotFillOrder);
const perpFills = events.filter(e => e.tag === LogType.perpFillOrder);

// Process fills
spotFills.forEach(fill => {
  console.log({
    side: fill.side === 0 ? 'BUY' : 'SELL',
    price: fill.price,
    quantity: fill.qty,
    value: fill.crncy,
    rebates: fill.rebates
  });
});
```

---

### Example 2: Get Client Trading Statistics

```typescript
await engine.setSigner(walletAddress);
const clientData = await engine.getClientData();

console.log({
  totalSpotTrades: clientData.spotTrades,
  totalPerpTrades: clientData.perpTrades,
  totalLpTrades: clientData.lpTrades,
  points: clientData.points
});

// Get perp position info for a specific instrument
const perpInfo = await engine.getClientPerpOrdersInfo({
  instrId: 1,
  clientId: clientData.clientId
});

console.log({
  perps: perpInfo.perps,           // Position size
  funds: perpInfo.funds,           // Margin balance
  realizedPnl: perpInfo.result,    // Realized PnL
  fees: perpInfo.fees,             // Total fees
  rebates: perpInfo.rebates,      // Total rebates
  fundingPayments: perpInfo.fundingFunds,
  leverage: perpInfo.mask & 0xFF   // Extract leverage from mask
});
```

---

### Example 3: Calculate Total Fees from Logs

```typescript
// Process multiple transactions
let totalSpotFees = 0;
let totalPerpFees = 0;
let totalRebates = 0;

for (const signature of transactionSignatures) {
  const tx = await rpc.getTransaction(signature, {
    maxSupportedTransactionVersion: 0
  }).send();
  
  const events = engine.logsDecode(tx.value.meta.logMessages);
  
  // Sum fees
  events.forEach(event => {
    if (event.tag === LogType.spotFees) {
      totalSpotFees += event.fees;
      totalRebates += event.refPayment; // Rebates might be in refPayment
    }
    if (event.tag === LogType.perpFees) {
      totalPerpFees += event.fees;
    }
  });
}

console.log({
  totalFees: totalSpotFees + totalPerpFees,
  netFees: totalSpotFees + totalPerpFees - totalRebates
});
```

---

### Example 4: Track Funding Payments

```typescript
let totalFundingPaid = 0;
let totalFundingReceived = 0;

// Process transactions
for (const signature of signatures) {
  const tx = await rpc.getTransaction(signature).send();
  const events = engine.logsDecode(tx.value.meta.logMessages);
  
  events.forEach(event => {
    if (event.tag === LogType.perpFunding) {
      if (event.funding < 0) {
        totalFundingPaid += Math.abs(event.funding);
      } else {
        totalFundingReceived += event.funding;
      }
    }
  });
}

console.log({
  totalFundingPaid,
  totalFundingReceived,
  netFunding: totalFundingReceived - totalFundingPaid
});
```

---

### Example 5: Get Market Data for Analytics

```typescript
// Update instrument data
await engine.updateInstrData({ instrId: 1 });

const instrument = engine.instruments.get(1);
const header = instrument.header;

console.log({
  // Current prices
  spotPrice: header.lastPx,
  perpPrice: header.perpLastPx,
  spotSpread: header.bestAsk - header.bestBid,
  perpSpread: header.perpBestAsk - header.perpBestBid,
  
  // Volume
  dailyVolume: header.dayCrncyTokens,
  allTimeVolume: header.alltimeCrncyTokens,
  
  // Perpetual data
  openInterest: header.perpOpenInt,
  fundingRate: header.perpFundingRate,
  maxLeverage: header.maxLeverage,
  
  // Orderbook depth
  spotBids: instrument.spotBids,
  spotAsks: instrument.spotAsks,
  perpBids: instrument.perpBids,
  perpAsks: instrument.perpAsks
});
```

---

## Key Takeaways for Analytics Dashboard

### Essential Methods:
1. **`logsDecode()`** - Extract all trade events from transactions
2. **`getClientData()`** - Get total trade counts and balances
3. **`getClientPerpOrdersInfo()`** - Get perp position data, PnL, fees
4. **`getClientSpotOrdersInfo()`** - Get spot order data
5. **`updateInstrData()`** - Get current market prices and statistics

### Key Log Types for Analytics:
- `LogType.spotFillOrder` (11) - Spot trade executions
- `LogType.perpFillOrder` (19) - Perp trade executions
- `LogType.perpFunding` (24) - Funding payments
- `LogType.spotFees` (15) / `LogType.perpFees` (23) - Fee tracking
- `LogType.perpSocLoss` (27) - Socialized losses
- `LogType.deposit` (1) / `LogType.withdraw` (2) - Capital flows

### Data Sources:
1. **Transaction Logs** → Use `logsDecode()` to extract trade fills
2. **Client Accounts** → Use `getClientData()` and `getClientPerpOrdersInfo()` for positions
3. **Instrument Accounts** → Use `updateInstrData()` for market prices and statistics

---

## Constants

### PROGRAM_ID
```typescript
export const PROGRAM_ID: Address<"DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD">
```

### VERSION
```typescript
export const VERSION = 1
```

### MARKET_DEPTH
```typescript
export const MARKET_DEPTH = 20
```

Default orderbook depth.

### Other Constants
```typescript
export const ADDRESS_LOOKUP_TABLE_PROGRAM_ID: Address<"AddressLookupTab1e1111111111111111111111111">
export const SYSTEM_PROGRAM_ID: Address<"11111111111111111111111111111111">
export const TOKEN_PROGRAM_ID: Address<"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA">
export const TOKEN_2022_PROGRAM_ID: Address<"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb">
export const ASSOCIATED_TOKEN_PROGRAM_ID: Address<"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL">
export const nullOrder = 65535           // Sentinel value for empty order slots
export let dec: number                   // Current decimal factor
export let lpDec: number                 // Current LP decimal factor
export function setDecimals(uiNumbers: boolean): void  // Toggle UI number mode
```

---

## Enums

### AccountType

Enumeration of all account types in the Deriverse protocol. Useful for finding specific accounts.

```typescript
enum AccountType {
  CLIENT_COMMUNITY = 35,
  CLIENT_PRIMARY = 31,
  COMMUNITY = 34,
  HOLDER = 1,
  ROOT = 2,
  INSTR = 7,
  SPOT_15M_CANDLES = 20,
  SPOT_1M_CANDLES = 19,
  SPOT_ASK_ORDERS = 17,
  SPOT_ASKS_TREE = 15,
  SPOT_BID_ORDERS = 16,
  SPOT_BIDS_TREE = 14,
  SPOT_CLIENT_INFOS = 12,
  SPOT_CLIENT_INFOS2 = 13,
  SPOT_DAY_CANDLES = 21,
  SPOT_LINES = 18,
  SPOT_MAPS = 10,
  TOKEN = 4,
  PERP_ASK_ORDERS = 36,
  PERP_ASKS_TREE = 37,
  PERP_BID_ORDERS = 38,
  PERP_BIDS_TREE = 39,
  PERP_CLIENT_INFOS = 41,
  PERP_CLIENT_INFOS2 = 42,
  PERP_CLIENT_INFOS3 = 43,
  PERP_CLIENT_INFOS4 = 44,
  PERP_CLIENT_INFOS5 = 45,
  PERP_LINES = 46,
  PERP_MAPS = 47,
  PERP_LONG_PX_TREE = 48,
  PERP_SHORT_PX_TREE = 49,
  PERP_REBALANCE_TIME_TREE = 50,
  PRIVATE_CLIENTS = 51
}
```

### OrderType

```typescript
enum OrderType {
  limit = 0,
  market = 1,
  marginCall = 2,
  forcedClose = 3
}
```

### InstrMask

Bitmask flags for instrument capabilities.

```typescript
enum InstrMask {
  DRV = 268435456,                  // 0x10000000
  READY_TO_DRV_UPGRADE = 536870912, // 0x20000000
  PERP = 1073741824,                // 0x40000000
  ORACLE = 2147483648,              // 0x80000000
  READY_TO_PERP_UPGRADE = 16777216  // 0x01000000
}
```

**Use Case:** Check instrument capabilities: `if (header.mask & InstrMask.PERP) { /* perps enabled */ }`

---

## Zod Validation Schemas

All argument types have corresponding Zod schemas exported for runtime validation. Import from `@deriverse/kit`:

```typescript
import { DepositArgsSchema, NewSpotOrderArgsSchema, ... } from '@deriverse/kit';

// Validate input at runtime
const validated = DepositArgsSchema.parse({ tokenId: 1, amount: 100 });
```

Available schemas: `EngineArgsSchema`, `InstrIdSchema`, `DepositArgsSchema`, `WithdrawArgsSchema`, `NewSpotOrderArgsSchema`, `SpotQuotesReplaceArgsSchema`, `SwapArgsSchema`, `SpotOrderCancelArgsSchema`, `SpotMassCancelArgsSchema`, `SpotLpArgsSchema`, `PerpDepositArgsSchema`, `PerpBuySeatArgsSchema`, `PerpSellSeatArgsSchema`, `NewPerpOrderArgsSchema`, `PerpQuotesReplaceArgsSchema`, `PerpOrderCancelArgsSchema`, `PerpMassCancelArgsSchema`, `PerpChangeLeverageArgsSchema`, `PerpStatisticsResetArgsSchema`, `PerpForcedCloseArgsSchema`, `NewInstrumentArgsSchema`, `GetInstrIdArgsSchema`, `GetSpotContextArgsSchema`, `GetInstrAccountByTagArgsSchema`, `UpdateInstrDataArgsSchema`, `DistribDividendsArgsSchema`, `GetClientSpotOrdersInfoArgsSchema`, `GetClientPerpOrdersInfoArgsSchema`, `GetClientSpotOrdersArgsSchema`, `GetClientPerpOrdersArgsSchema`.

---

## Instruction Builder Functions

Low-level functions that build raw instruction `Buffer` data. These are used internally by the Engine's instruction methods but are also exported for advanced use:

`newSpotOrderData`, `newPerpOrderData`, `depositData`, `withdrawData`, `perpDepositData`, `perpWithdrawData`, `spotOrderCancelData`, `perpOrderCancelData`, `spotMassCancelData`, `perpMassCancelData`, `spotLpData`, `spotQuotesReplaceData`, `perpQuotesReplaceData`, `perpChangeLeverageData`, `perpStatisticsResetData`, `swapData`, `feesDepositData`, `feesWithdrawData`, `buyMarketSeatData`, `sellMarketSeatData`, `votingData`, `airdropData`, `newOperatorData`, `newRootAccountData`, `newInstrumentData`, `upgradeToPerpData`, `setInstrReadyForPerpUpgradeData`, `changeRefProgramData`, `newPrivateClient`, `pointsProgramExpiration`, `setVarianceData`, `changeDenominatorData`, `newBaseCrncyData`, `perpClientsProcessingData`, `setSeatPurchasingFeeData`, `changeVotingData`, `garbageCollectorData`, `activateClientRefProgramData`, `moveSpotAvailFundsData`.

---

## Additional Structure Models

These models parse raw on-chain account data via `static fromBuffer()`. All exposed from the package root.

| Model | Description |
|---|---|
| `RootStateModel` | Protocol root state (operator, holder, token/instr counts, ref program config) |
| `TokenStateModel` | Token registration (address, programAddress, id, mask) |
| `InstrAccountHeaderModel` | 140+ fields: prices, volumes, orderbook state, perp data, funding, etc. |
| `CandleModel` | OHLCV data point |
| `CandlesAccountHeaderModel` | Header for candle data accounts |
| `LineQuotesModel` | Orderbook price level (px, qty) |
| `OrderModel` | Individual order in orderbook |
| `PxOrdersModel` | Price-level order aggregation (price, qty, linked list pointers) |
| `CommunityAccountHeaderModel` | Community governance (voting, fee rates, pool ratios) |
| `ClientCommunityAccountHeaderModel` | Per-client community data (voting, DRVS tokens) |
| `ClientCommunityRecordModel` | Per-client per-currency community record (dividends, fees, referrals) |
| `BaseCrncyRecordModel` | Base currency config (rate, denominator, locked DRVS) |
| `ClientPrimaryAccountHeaderModel` | Full client account (wallet, ref links, trade counts, VM state) |
| `SpotClientInfoModel` / `SpotClientInfo2Model` | Per-instrument spot client data |
| `PerpClientInfoModel` / `PerpClientInfo2Model` | Per-instrument perp client data |
| `PerpClientInfo3Model` | Perp client fees/rebates |
| `PerpClientInfo4Model` | Perp client socialized loss data |
| `PerpClientInfo5Model` | Perp client funding data |
| `HolderAccountHeaderModel` / `OperatorModel` | Protocol operator management |
| `SpotTradeAccountHeaderModel` / `PerpTradeAccountHeaderModel` | Trade account headers |
| `ClientSpotModel` / `ClientPerpModel` | Client spot/perp registration |
| `AssetRecordModel` | Asset record (assetId, tempId, value) |
| `PrivateClientHeaderModel` / `PrivateClientModel` | Private client registration |
| `AutoBuffer` / `AutoData` | Internal buffer readers for binary deserialization |

---

## Notes

1. **Log Decoding**: The `logsDecode()` method is the primary way to extract trade data from blockchain transactions. It handles all 33 event types automatically.

2. **Real-time Updates**: Use `updateInstrDataFromBuffer()` and `updateCommunityFromBuffer()` for real-time updates via Solana account subscriptions.

3. **Position Tracking**: For perpetual positions, use `getClientPerpOrdersInfo()` to get current position size, cost basis, and realized PnL.

4. **Fee Calculation**: Fees are tracked separately in log events (`spotFees`, `perpFees`) and also aggregated in client info responses.

5. **Price Data**: Current market prices are available in `InstrAccountHeaderModel` after calling `updateInstrData()`.

6. **Trade Direction**: In log models, `side: 0` = bid/buy/long, `side: 1` = ask/sell/short.

7. **Input Validation**: All method args have Zod schemas for runtime validation.

8. **InstrMask**: Check instrument capabilities using bitwise AND with `InstrMask` enum values.

---

## Integration with Backend API

The `@deriverse/kit` SDK can be used alongside the backend API:

- **Backend API** (`/api/trades/:wallet`) - Get historical trades from database
- **SDK** (`logsDecode()`) - Extract real-time trades from new transactions
- **SDK** (`getClientPerpOrdersInfo()`) - Get current position data and unrealized PnL
- **SDK** (`updateInstrData()`) - Get current market prices for PnL calculations

Combine both for comprehensive analytics:
- Historical data from backend database
- Real-time position data from SDK
- Current prices from SDK
- Trade event extraction from SDK

---

For more information, refer to the main Deriverse documentation or the source code in `node_modules/@deriverse/kit`.
