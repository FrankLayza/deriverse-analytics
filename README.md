# Deriverse Analytics Dashboard

A comprehensive trading analytics solution for Deriverse - a next-gen, fully on-chain Solana trading ecosystem.

## 🎯 Features Implemented

### Core Analytics
- ✅ Total PnL tracking with visual indicators
- ✅ Trading volume and fee analysis
- ✅ Win rate statistics and trade count
- ✅ Average trade duration calculations
- ✅ Long/Short ratio analysis
- ✅ Largest gain/loss tracking
- ✅ Average win/loss amount analysis
- ✅ Profit factor calculation
- ✅ Maximum drawdown tracking

### Filtering & Visualization
- ✅ Symbol-specific filtering
- ✅ Date range selection
- ✅ Historical PnL chart with cumulative tracking
- ✅ Detailed trade history table with sorting
- ✅ Responsive design for mobile/desktop

### To Be Implemented
- ⏳ Real Solana blockchain integration
- ⏳ Time-based performance metrics (hourly/daily)
- ⏳ Fee composition breakdown
- ⏳ Order type performance analysis
- ⏳ Trade annotation capabilities
- ⏳ Export functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Basic understanding of Next.js and React

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
deriverse-analytics/
├── app/
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── MetricCard.tsx    # Reusable metric display
│   ├── PnLChart.tsx      # Cumulative PnL chart
│   ├── TradeTable.tsx    # Trade history table
│   └── FilterPanel.tsx   # Symbol/date filters
├── lib/
│   ├── analytics.ts      # Calculation utilities
│   ├── mockData.ts       # Mock data generator
│   └── solana.ts         # TODO: Solana integration
├── types/
│   └── index.ts          # TypeScript type definitions
└── README.md
```

## 🔧 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Blockchain**: @solana/web3.js (to be integrated)
- **State**: React Hooks

## 🔗 Solana Integration (Next Steps)

The current implementation uses mock data. To integrate with Deriverse:

1. **Study Deriverse Documentation**
   - Review smart contract structure
   - Understand event logs and transaction format
   - Identify key program IDs

2. **Fetch Trade Data**
   ```typescript
   // lib/solana.ts example
   import { Connection, PublicKey } from '@solana/web3.js';
   
   const connection = new Connection('https://api.mainnet-beta.solana.com');
   const DERIVERSE_PROGRAM_ID = new PublicKey('...');
   
   async function fetchUserTrades(walletAddress: string) {
     // Fetch transaction signatures
     // Parse trade events
     // Transform to Trade[] format
   }
   ```

3. **Replace Mock Data**
   - Update `app/page.tsx` to call `fetchUserTrades()`
   - Add wallet connection component
   - Handle loading/error states

## 📊 Calculation Methods

### Win Rate
```typescript
winRate = (winningTrades / totalTrades) * 100
```

### Profit Factor
```typescript
profitFactor = totalWins / totalLosses
```

### Max Drawdown
```typescript
// Tracks largest peak-to-trough decline in cumulative PnL
```

## 🎨 Customization

### Adding New Metrics
1. Add type to `types/index.ts`
2. Update calculation in `lib/analytics.ts`
3. Create component in `components/`
4. Add to dashboard in `app/page.tsx`

### Styling
- Colors defined in `tailwind.config.js`
- Profit color: `#10b981` (green)
- Loss color: `#ef4444` (red)
- Primary: `#8b5cf6` (purple)

## 📝 Development Roadmap

### Week 1 (Days 1-6)
- [x] Project setup and dependencies
- [x] Core components and layout
- [x] Mock data generation
- [x] Basic analytics calculations
- [ ] Solana connection setup

### Week 2 (Days 7-12)
- [ ] Real blockchain data fetching
- [ ] Advanced filtering (time-based)
- [ ] Fee breakdown visualization
- [ ] Order type analysis

### Week 3 (Days 13-18)
- [ ] Trade annotations
- [ ] Export functionality
- [ ] Testing and bug fixes
- [ ] Documentation and deployment

## 🐛 Known Issues

- Currently using mock data (needs Solana integration)
- Dark mode toggle not implemented
- Mobile table scrolling needs improvement

## 📄 License

MIT License - feel free to use for the Deriverse bounty submission

## 🤝 Contributing

This is a bounty submission project. Feedback and suggestions welcome!

## 📧 Contact

- GitHub: [Your GitHub]
- Twitter: [Your Twitter]

---

**Note**: This dashboard is currently in development for the Deriverse bounty. Real Solana integration is the next critical step.
