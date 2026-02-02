# Project Structure Explained

## 📁 Complete Directory Tree

```
deriverse-analytics/
│
├── 📱 app/                          # Next.js App Router
│   ├── page.tsx                    # Main dashboard (START HERE for UI)
│   ├── layout.tsx                  # Root layout wrapper
│   └── globals.css                 # Global Tailwind styles
│
├── 🧩 components/                   # Reusable UI Components
│   ├── MetricCard.tsx              # Display individual metrics
│   ├── PnLChart.tsx                # Cumulative PnL chart
│   ├── TradeTable.tsx              # Trade history table with sorting
│   └── FilterPanel.tsx             # Symbol & date filters
│
├── 📚 lib/                          # Business Logic & Utilities
│   ├── analytics.ts                # ⭐ Metric calculations
│   ├── mockData.ts                 # Mock trade generator
│   └── solana.ts                   # 🔥 Blockchain integration (TO DO)
│
├── 📐 types/                        # TypeScript Type Definitions
│   └── index.ts                    # All interfaces and types
│
├── 📄 Configuration Files
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.js          # Tailwind customization
│   ├── next.config.js              # Next.js config
│   ├── postcss.config.js           # PostCSS config
│   ├── .env.example                # Environment variables template
│   └── .gitignore                  # Git ignore rules
│
└── 📖 Documentation
    ├── README.md                   # Main project documentation
    ├── QUICK_START.md              # 5-minute setup guide
    ├── DEVELOPMENT_GUIDE.md        # 18-day development plan
    └── PROJECT_STRUCTURE.md        # This file!
```

## 🎯 File Responsibilities

### Core Application Files

#### `app/page.tsx` - The Main Dashboard
**What it does:**
- Fetches/generates trade data
- Manages filters (symbol, date range)
- Calculates metrics
- Renders all components
- Handles state management

**When to edit:**
- Adding new dashboard sections
- Changing layout
- Adding new filters
- Integrating wallet connection

**Key code sections:**
```typescript
// Data fetching
useEffect(() => {
  const mockTrades = generateMockTrades(100);
  setAllTrades(mockTrades);
}, []);

// Filtering logic
const filteredTrades = useMemo(() => {
  return allTrades.filter(/* filter logic */);
}, [allTrades, selectedSymbol, startDate, endDate]);

// Metric calculations
const metrics = useMemo(() => 
  calculateMetrics(filteredTrades), 
  [filteredTrades]
);
```

#### `lib/analytics.ts` - The Brain
**What it does:**
- Calculates all trading metrics
- Generates time series data
- Formats numbers/currency
- Computes statistics

**When to edit:**
- Adding new metrics (Sharpe ratio, etc.)
- Fixing calculation bugs
- Adding new chart data formats
- Optimizing performance

**Key functions:**
```typescript
calculateMetrics(trades)          // Main metrics calculator
generateTimeSeriesData(trades)    // Chart data generator
calculateSymbolPerformance(trades) // Per-symbol stats
formatCurrency(value)             // $1,234.56
formatPercent(value)              // 45.67%
formatDuration(seconds)           // 2h 30m
```

#### `lib/solana.ts` - Blockchain Bridge
**What it does:**
- Connects to Solana blockchain
- Fetches transaction history
- Parses Deriverse trades
- Subscribes to real-time updates

**When to edit:**
- 🔥 FIRST PRIORITY - Implement real data fetching
- Update program ID
- Parse transaction format
- Handle errors

**TODO functions:**
```typescript
fetchUserTrades(walletAddress)    // Fetch all trades
parseTransaction(tx)              // Parse trade data
subscribeToTrades(address, cb)    // Real-time updates
```

### Component Files

#### `components/MetricCard.tsx`
**Purpose:** Display single metrics with icon & trend
**Props:**
- `title`: Metric name
- `value`: Metric value
- `subtitle`: Additional info
- `trend`: 'up' | 'down' | 'neutral'
- `icon`: React icon component

**Usage:**
```tsx
<MetricCard
  title="Total PnL"
  value={formatCurrency(1234.56)}
  trend="up"
  icon={<TrendingUp />}
/>
```

#### `components/PnLChart.tsx`
**Purpose:** Visualize cumulative PnL over time
**Props:**
- `data`: TimeSeriesData[] array

**Features:**
- Area chart with gradient
- Responsive to container
- Custom tooltips
- Date formatting

#### `components/TradeTable.tsx`
**Purpose:** Display detailed trade history
**Props:**
- `trades`: Trade[] array

**Features:**
- Sortable columns
- Color-coded PnL
- Long/Short badges
- Responsive layout

#### `components/FilterPanel.tsx`
**Purpose:** Filter trades by symbol & date
**Props:**
- Symbol dropdown values
- Selected symbol
- Date range
- Change handlers

### Type Definitions

#### `types/index.ts`
**Defines all TypeScript interfaces:**

```typescript
Trade                  // Single trade data
PortfolioMetrics      // Calculated metrics
TimeSeriesData        // Chart data points
SymbolPerformance     // Per-symbol stats
DateRange             // Date filter
FilterOptions         // Filter state
```

**Why types matter:**
- Catch bugs at compile time
- Better autocomplete
- Self-documenting code
- Easier refactoring

## 🔄 Data Flow

```
1. User Opens Dashboard
   ↓
2. app/page.tsx loads
   ↓
3. Generate/Fetch Trades
   ↓
   [Current] lib/mockData.ts generates fake data
   [Future]  lib/solana.ts fetches real blockchain data
   ↓
4. Apply Filters
   ↓
   Filter by symbol/date in page.tsx
   ↓
5. Calculate Metrics
   ↓
   lib/analytics.ts processes trades
   ↓
6. Render Components
   ↓
   MetricCards, Charts, Tables display results
   ↓
7. User Interaction
   ↓
   Change filters → Re-calculate → Re-render
```

## 🎨 Styling System

### Tailwind CSS Classes
**Location:** Any component file
**Pattern:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg p-6">
  // Component content
</div>
```

**Common patterns:**
- `bg-white dark:bg-gray-800` - Light/dark backgrounds
- `text-profit` / `text-loss` - Green/red for PnL
- `md:grid-cols-2 lg:grid-cols-4` - Responsive grids
- `hover:bg-gray-50` - Interactive states

### Color Customization
**Location:** `tailwind.config.js`
```javascript
colors: {
  profit: '#10b981',   // Success/green
  loss: '#ef4444',     // Error/red
  primary: '#8b5cf6',  // Brand purple
}
```

## 🔧 Configuration Files Explained

### `package.json`
**Dependencies included:**
- `next` - React framework
- `@solana/web3.js` - Blockchain interaction
- `recharts` - Chart library
- `zustand` - State management (if needed)
- `lucide-react` - Icons

### `tsconfig.json`
**TypeScript settings:**
- Strict mode enabled (catches more bugs)
- Path aliases: `@/` → root directory
- Latest ES features enabled

### `tailwind.config.js`
**Customizations:**
- Custom colors (profit/loss/primary)
- Content paths for purging
- Dark mode support

## 📊 Metric Calculations Explained

### Win Rate
```typescript
winRate = (winning_trades / total_trades) × 100

Example:
60 wins out of 100 trades = 60% win rate
```

### Profit Factor
```typescript
profitFactor = total_wins / total_losses

Example:
$5,000 in wins / $2,000 in losses = 2.5 profit factor
(2.5 means you make $2.50 for every $1 lost)
```

### Long/Short Ratio
```typescript
ratio = long_trades / short_trades

Example:
70 longs / 30 shorts = 2.33 ratio
(You trade long 2.33x more than short)
```

### Max Drawdown
```typescript
Track cumulative PnL
Record peak value
Calculate largest drop from peak to trough

Example:
Peak: $10,000
Trough: $7,500
Drawdown: $2,500 (25%)
```

## 🚀 Development Workflow

### Adding a New Feature

1. **Define Types** (if needed)
   ```typescript
   // types/index.ts
   export interface NewFeature {
     // Define structure
   }
   ```

2. **Create Logic**
   ```typescript
   // lib/analytics.ts
   export function calculateNewMetric(trades: Trade[]) {
     // Calculation logic
   }
   ```

3. **Build Component**
   ```typescript
   // components/NewComponent.tsx
   export default function NewComponent({ data }) {
     // Render logic
   }
   ```

4. **Integrate in Dashboard**
   ```typescript
   // app/page.tsx
   <NewComponent data={calculatedData} />
   ```

### Testing Changes

1. Save file
2. Check terminal for build errors
3. Refresh browser (hot reload usually automatic)
4. Check browser console for runtime errors
5. Test on mobile (responsive design)

## 🎓 Learning Path

### If you're new to:

**Next.js:**
- Focus on `app/page.tsx` first
- Learn about Server vs Client components
- Understand file-based routing

**TypeScript:**
- Read `types/index.ts` to understand data shapes
- Pay attention to type errors
- Use IDE autocomplete

**Tailwind:**
- Check existing components for patterns
- Use Tailwind docs as reference
- Experiment with classes

**Solana:**
- Start with Solana Cookbook
- Use Solscan to inspect transactions
- Join Solana Discord for help

## 💡 Pro Tips

1. **Always start with types** - Define data structure first
2. **Use mock data initially** - Perfect UI before real data
3. **Console.log everything** - Debug by printing
4. **Check both terminals** - Build errors vs runtime errors
5. **Read error messages** - TypeScript errors are helpful
6. **Commit often** - Small, working changes
7. **Test on real data early** - Don't wait too long

## 🏁 Next Steps

1. ✅ You understand the structure
2. 🔥 Implement Solana integration in `lib/solana.ts`
3. 🎨 Customize styling in components
4. 📊 Add more metrics in `lib/analytics.ts`
5. 🚀 Deploy and submit!

---

**Questions?** Check `DEVELOPMENT_GUIDE.md` for detailed day-by-day tasks.
