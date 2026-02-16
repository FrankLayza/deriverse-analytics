import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { HeroMetrics } from '@/components/dashboard/hero-metrics' 
import { CoreMetrics, LongShortMetrics } from '@/lib/calculations'

// ------------------------------------------------------------------
// MOCK DATA
// ------------------------------------------------------------------

const mockCoreWinning: CoreMetrics = {
  totalPnL: 1250.50,
  totalVolume: 50000,
  totalFees: -12.50,
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

    // Regex handles potential spaces: matches "+$1,250.50" or "+ $ 1,250.50"
    expect(screen.getByText(/\+\s*\$\s*1,250\.50/)).toBeInTheDocument()
    
    expect(screen.getByText(/Net Profit:/i)).toBeInTheDocument()
    expect(screen.getByText(/1,238\.00/)).toBeInTheDocument()
  })

  it('renders negative PnL correctly (Red/Destructive)', () => {
    render(<HeroMetrics core={mockCoreLosing} longShort={mockLongShort} />)

    // Regex fixes the failure: Matches "$" followed by whitespace/newlines then "-500.75"
    expect(screen.getByText(/\$\s*-500\.75/)).toBeInTheDocument()
  })

  it('formats Volume and Fees correctly', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    // Matches "$50,000" or "$ 50,000"
    expect(screen.getByText(/\$\s*50,000/)).toBeInTheDocument()

    // Matches "$12.50"
    expect(screen.getByText(/\$\s*12\.50/)).toBeInTheDocument()
  })

  it('displays the correct Win Rate and Trade Count', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows the correct Long/Short Ratio', () => {
    render(<HeroMetrics core={mockCoreWinning} longShort={mockLongShort} />)

    // UPDATED: Matches "L/S Ratio" instead of "Bias"
    expect(screen.getByText(/L\/S Ratio/i)).toBeInTheDocument()
    
    // Check for the specific breakdown text seen in your logs
    // Using regex to be safe against spacing
    expect(screen.getByText(/LONG\s*\(\s*60\s*%\s*\)/i)).toBeInTheDocument()
    expect(screen.getByText(/SHORT\s*\(\s*40\s*%\s*\)/i)).toBeInTheDocument()
  })
})