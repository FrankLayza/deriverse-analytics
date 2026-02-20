# Deriverse Analytics Dashboard

A comprehensive, real-time trading analytics dashboard for [Deriverse](https://deriverse.io) — a fully on-chain Solana trading ecosystem. Connect your wallet, sync your on-chain trade history, and visualize your performance with rich, interactive charts and metrics.

---

## ✨ Features

### 🔗 Live Solana Integration
- **Wallet connection** via Solana Wallet Adapter (Phantom, Solflare, etc.)
- **On-chain trade fetching** — decodes Deriverse program logs (fill events, place-order events)
- **Automatic sync** on wallet connection with manual re-sync support
- **Rate-limited ingestion** API to prevent abuse (5 syncs per 5 minutes)

### 📊 Core Analytics
- Total PnL tracking with visual indicators
- Trading volume and fee analysis
- Win rate statistics and trade count
- Long/Short ratio with bullish/bearish bias detection
- Largest gain/loss tracking
- Average win/loss and profit factor
- Maximum drawdown with drawdown chart
- Average trade duration (matched buy/sell pairs)

### 📈 Interactive Visualizations
- **Historical PnL chart** — cumulative PnL over time
- **Drawdown chart** — peak-to-trough decline tracking
- **Fee composition** — spot vs perp breakdown with per-symbol analysis
- **Session performance** — daily trading session metrics
- **Risk & averages** — key risk indicators at a glance

### 📓 Trade Journal
- Sortable, paginated trade history table
- Search by asset symbol
- Filter by side (Buy/Sell)
- Mobile-responsive card view + desktop table view

### 🔒 Security
- **Server-side data sanitization** — sensitive fields (`wallet_address`, `user_id`, `signature`, etc.) are stripped via a server-side API proxy and never exposed in the browser's Network tab
- **Session timeout** — wallet auto-disconnects after 10 minutes of inactivity
- **Error boundary** components prevent crashes from propagating

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **pnpm** (or npm/yarn)
- A **Supabase** project with the trades table (see `.env.example`)
- A Solana wallet (e.g. Phantom)

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run unit tests
pnpm test
```

---

## 📁 Project Structure

```
deriverse-analytics/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts       # POST — syncs on-chain trades to Supabase
│   │   ├── trades/route.ts       # GET  — returns sanitized trade data
│   │   └── analytics/route.ts    # Analytics API endpoint
│   ├── page.tsx                  # Main dashboard page
│   ├── layout.tsx                # Root layout with providers
│   └── globals.css               # Global styles & design tokens
│
├── components/
│   ├── dashboard/
│   │   ├── top-nav.tsx           # Navigation bar with sync button
│   │   ├── hero-metrics.tsx      # Top-level metric cards
│   │   ├── performance-charts.tsx # PnL & drawdown charts
│   │   ├── trade-journal.tsx     # Filterable trade history table
│   │   └── breakdown-charts.tsx  # Fee & session pie charts
│   ├── ClientProvider.tsx        # Wallet & query providers
│   ├── EmptyState.tsx            # No-trades placeholder
│   ├── StatsSkeleton.tsx         # Loading skeleton
│   ├── error-boundary.tsx        # Error boundary wrapper
│   ├── motion-container.tsx      # Animation wrapper
│   └── ui/                      # shadcn/ui component library
│
├── hooks/
│   ├── useDashboard.ts           # Main data hook (fetch → enrich → calculate)
│   ├── useWalletTimeout.ts       # Session timeout logic
│   └── use-mobile.tsx            # Mobile breakpoint detection
│
├── lib/
│   ├── api/
│   │   └── trade.ts              # Client-side API functions + DashboardTrade type
│   ├── calculations.ts           # All analytics calculations (PnL, drawdown, etc.)
│   ├── fetch-trade.ts            # On-chain trade fetcher (Deriverse program logs)
│   ├── deriverse.ts              # Deriverse program constants
│   ├── deriverse-mapper.ts       # Instrument ID to symbol mapping
│   ├── middleware/
│   │   └── ratelimit.ts          # In-memory rate limiter
│   └── utils.ts                  # Shared utilities
│
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
│
├── utils/
│   └── supabase.ts               # Supabase client + database type definitions
│
├── __test__/                     # Test suite
└── keys/                         # Key files (gitignored)
```

---

## 🏗️ Architecture

### Data Flow

```
Solana Blockchain
      │
      ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  POST /api/ingest│ ──▶ │    Supabase DB    │ ◀── │ GET /api/trades │
│  (fetch & store) │     │  (trades table)   │     │ (sanitized)     │
└─────────────────┘     └──────────────────┘     └───────┬───────┘
                                                          │
                                                          ▼
                                                   ┌─────────────┐
                                                   │  useDashboard │
                                                   │  (React hook) │
                                                   └──────┬──────┘
                                                          │
                                              ┌───────────┼───────────┐
                                              ▼           ▼           ▼
                                         enrichPnL   coreMetrics   charts
                                              │           │           │
                                              ▼           ▼           ▼
                                         ┌────────────────────────────┐
                                         │      Dashboard UI          │
                                         └────────────────────────────┘
```

1. **Sync (`POST /api/ingest`)** — Fetches on-chain trade data from Deriverse program logs, decodes fill/place-order events, resolves trading pairs, and upserts into Supabase.

2. **Read (`GET /api/trades`)** — Server-side route that queries Supabase and returns **only** the fields needed by the dashboard (sanitized). Sensitive data like `wallet_address`, `user_id`, and `signature` never leave the server.

3. **Transform (`useDashboard` hook)** — Enriches raw trades with dynamically calculated PnL (FIFO/average cost basis), then generates all dashboard metrics using `calculations.ts`.

4. **Render** — Dashboard components consume the pre-calculated metrics with `useMemo` caching to prevent unnecessary recalculations.

### Data Sanitization

The `GET /api/trades` route acts as a security proxy. It selects only these columns from Supabase:

| Returned (Safe)     | Excluded (Sensitive)     |
|---------------------|--------------------------|
| `id`                | `user_id`                |
| `side`              | `wallet_address`         |
| `symbol`            | `signature`              |
| `price`             | `client_id`              |
| `quantity`          | `executed_at`            |
| `block_time`        | `notes`                  |
| `realized_pnl`      | `tags`                   |
| `fees`              | `created_at`             |
| `instrument_id`     |                          |
| `market_type`       |                          |
| `order_type`        |                          |

---

## 🔧 Technology Stack

| Category       | Technology                                                |
|----------------|-----------------------------------------------------------|
| **Framework**  | Next.js 16 (App Router)                                   |
| **Language**   | TypeScript 5.9                                            |
| **Styling**    | Tailwind CSS 4 + shadcn/ui                                |
| **Charts**     | Recharts                                                  |
| **Animations** | Motion (Framer Motion)                                    |
| **Blockchain** | @solana/web3.js, @solana/wallet-adapter, @deriverse/kit   |
| **Database**   | Supabase (PostgreSQL)                                     |
| **Data Layer** | TanStack React Query (caching, mutations)                 |
| **Testing**    | Jest + React Testing Library                              |

---

## 📊 Calculation Methods

### PnL Enrichment (FIFO / Average Cost)
Trades are grouped by `instrument_id` and processed chronologically. Each BUY/SELL is matched against the current position to calculate realized PnL:

- **Opening a position** — updates the weighted average entry price
- **Closing a position** — calculates `(exit_price - avg_entry) × size_closed`
- **Flipping** (long → short or vice versa) — closes fully, then opens in the opposite direction

### Win Rate
```
winRate = (winningTrades / totalTrades) × 100
```

### Profit Factor
```
profitFactor = totalWins / totalLosses
```

### Max Drawdown
Tracks the largest peak-to-trough decline in cumulative PnL across the full trade history.

### Long/Short Bias
```
ratio = longTrades / shortTrades
BULLISH  if ratio > 1.2
BEARISH  if ratio < 0.8
NEUTRAL  otherwise
```

---

## 🎨 Customization

### Adding New Metrics

1. Add the calculation function to `lib/calculations.ts` (accepts `DashboardTrade[]`)
2. Call it inside the `useMemo` block in `hooks/useDashboard.ts`
3. Create/update a component in `components/dashboard/`
4. Wire it up in `app/page.tsx`

### Adding New Safe Fields

If a new field needs to reach the browser:

1. Add it to the `SAFE_FIELDS` array in `app/api/trades/route.ts`
2. Add it to the `DashboardTrade` Pick type in `lib/api/trade.ts`

---

## 📝 Scripts

| Command                  | Description                              |
|--------------------------|------------------------------------------|
| `pnpm dev`               | Start development server                 |
| `pnpm build`             | Production build                         |
| `pnpm start`             | Start production server                  |
| `pnpm test`              | Run test suite                           |
| `pnpm lint`              | Lint with ESLint                         |
| `pnpm fetch-history`     | Fetch trade history (standalone script)  |
| `pnpm test-deriverse`    | Test Deriverse integration               |

---

## 📄 License

MIT License

---

## 📧 Contact

- GitHub: [Your GitHub]
- Twitter: [Your Twitter]
