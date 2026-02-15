import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { HeroMetrics } from '@/components/dashboard/hero-metrics' // Adjust path if needed
import { CoreMetrics, LongShortMetrics } from '@/lib/calculations'

// ------------------------------------------------------------------
// MOCK DATA
// ------------------------------------------------------------------

const mockCoreWinning: CoreMetrics = {
  totalPnL: 1250.50,
  totalVolume: 50000,
  totalFees: -12.50, // Negative in DB, displayed as positive "Fees Paid"
  netPnL: 1238.00,
  totalTrades: 10,
  winningTrades: 6,
  losingTrades: 4,
  winRate: 60,
}

const mockCoreLosing: CoreMetrics = {
  ...mockCoreWinning,
  totalPnL: -500.75,
  netPnL: -513.25,
  winRate: 30,
}

const mockLongShort: LongShortMetrics = {
  longTrades: 6,
  shortTrades: 4,
  longVolume: 30000,
  shortVolume: 20000,
  ratio: 1.5,
  bias: 'BULLISH',
}

// ------------------------------------------------------------------
// TESTS
// ------------------------------------------------------------------

describe('HeroMetrics Component', () => {

  it('renders positive PnL correctly (Green/Primary)', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    // Check for the exact formatted string
    // logic: core.totalPnL >= 0 ? '+' : ''
    expect(screen.getByText('+$1,250.50')).toBeInTheDocument()
    
    // Check Net Profit label
    expect(screen.getByText('Net Profit: $1,238.00')).toBeInTheDocument()
  })

  it('renders negative PnL correctly (Red/Destructive)', () => {
    render(<HeroMetrics core={mockCoreLosing} longShort={mockLongShort} />)

    // Check for formatted negative string
    // Note: Your component renders "-$500.75", not "+-$500.75" because of the ternary logic
    expect(screen.getByText('-$500.75')).toBeInTheDocument()
  })

  it('formats Volume and Fees correctly', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    // Volume: 0 decimal places
    expect(screen.getByText('$50,000')).toBeInTheDocument()

    // Fees: Should display absolute value (12.50) not -12.50
    // The component uses Math.abs(core.totalFees)
    expect(screen.getByText('$12.50')).toBeInTheDocument()
  })

  it('displays the correct Win Rate and Trade Count', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    // Win Rate %
    expect(screen.getByText('60%')).toBeInTheDocument()
    
    // Total Trades count
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows the correct Long/Short Bias', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    // Check for the "L/S Bias: BULLISH" text
    // We use a regex /bullish/i to be case-insensitive just in case
    expect(screen.getByText(/bias: bullish/i)).toBeInTheDocument()
    
    // Check percentages (6 long, 4 short = 60% / 40%)
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })
})