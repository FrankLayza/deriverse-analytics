# Quick Start Guide - Deriverse Analytics

## ⚡ Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
cp .env.example .env
# Edit .env and add your Solana RPC endpoint (optional for now)
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Open Browser
Navigate to `http://localhost:3000`

You should see the dashboard with mock trading data!

## 📋 What You're Looking At

The dashboard shows:
- **8 Key Metrics** - PnL, Win Rate, Volume, etc.
- **Performance Chart** - Cumulative PnL over time
- **Trade History Table** - Detailed list of all trades
- **Filters** - Filter by symbol and date range

## 🔧 Next Steps

### Priority 1: Connect to Solana (Days 1-4)

1. **Find Deriverse's Program ID**
   - Check their documentation
   - Look at example transactions on Solscan
   - Update `lib/solana.ts` line 13

2. **Study Their Transaction Format**
   ```bash
   # Example: Check a transaction on Solscan
   # https://solscan.io/tx/[transaction_hash]
   ```

3. **Implement Real Data Fetching**
   - Open `lib/solana.ts`
   - Complete the `parseTransaction()` function
   - Test with a real wallet address

4. **Add Wallet Connection**
   ```bash
   # Install wallet adapter UI components
   npm install @solana/wallet-adapter-react-ui
   ```

### Priority 2: Enhanced Features (Days 5-12)

- Add more chart types
- Implement trade annotations
- Create fee breakdown visualization
- Add time-based analysis

### Priority 3: Polish & Deploy (Days 13-18)

- Test thoroughly
- Fix bugs
- Write documentation
- Deploy to Vercel
- Submit bounty!

## 🎯 File Structure Guide

```
Key files to work with:

📄 lib/solana.ts          ← START HERE: Connect to blockchain
📄 app/page.tsx           ← Main dashboard logic
📄 lib/analytics.ts       ← Add new metrics here
📄 components/*.tsx       ← UI components
📄 types/index.ts         ← Type definitions
```

## 🚨 Important Notes

### Currently Using Mock Data
The dashboard uses fake data generated in `lib/mockData.ts`. This is intentional for development. Replace it with real Solana data as your first task.

### Solana RPC Endpoints
Free tier:
- `https://api.mainnet-beta.solana.com` (rate limited)

Better options:
- Helius (generous free tier)
- QuickNode
- Alchemy

### TypeScript Strict Mode
This project uses strict TypeScript. If you see errors:
1. Don't ignore them - fix them
2. TypeScript prevents runtime bugs
3. Better to catch issues early

## 📚 Key Resources

### Must Read
1. **Deriverse Docs** - Understanding their platform
2. **Solana Web3.js** - Blockchain interaction
3. **Recharts Docs** - Chart customization
4. **Next.js App Router** - Framework features

### Helpful Commands
```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Run production build
npm run lint          # Check code quality

# Useful during development
npm run build && npm start  # Test production build locally
```

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check all errors
npm run build
# Often fixed by adding proper types
```

### Solana Connection Issues
- Check RPC endpoint in `.env`
- Verify network (mainnet vs devnet)
- Test RPC endpoint with curl

## 💡 Development Tips

1. **Start Small**
   - Get one thing working at a time
   - Don't try to implement everything at once

2. **Test Frequently**
   - Refresh browser after changes
   - Check console for errors
   - Use console.log liberally

3. **Use Mock Data First**
   - Perfect the UI with mock data
   - Then switch to real data
   - Easier to debug

4. **Read the Logs**
   - Terminal shows build errors
   - Browser console shows runtime errors
   - Both are your friends

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  profit: '#10b981',  // Change this
  loss: '#ef4444',    // And this
  primary: '#8b5cf6', // And this
}
```

### Add New Metric
1. Define type in `types/index.ts`
2. Calculate in `lib/analytics.ts`
3. Display with `<MetricCard />`

### New Chart Type
```typescript
import { BarChart, Bar } from 'recharts';
// See Recharts docs for more
```

## 🏆 Success Criteria

Your dashboard is ready when:
- ✅ Connects to a real Solana wallet
- ✅ Fetches real Deriverse trades
- ✅ All metrics calculate correctly
- ✅ Charts display properly
- ✅ Filters work as expected
- ✅ Mobile responsive
- ✅ No errors in console
- ✅ Fast load times (<3 seconds)

## 🚀 Ready to Build!

You now have:
- Complete project structure
- Working dashboard with mock data
- TypeScript types defined
- Reusable components
- Analytics calculations
- Chart templates
- Comprehensive documentation

**Your main task**: Replace mock data with real Solana blockchain data from Deriverse!

Good luck! 🎯
