/**
 * API Route: /api/analytics
 * GET: Calculate all analytics metrics for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import type { Trade } from '@/utils/supabase';
import {
  calculateCoreMetrics,
  calculateLongShortRatio,
  calculateRiskMetrics,
  generatePnLTimeSeries,
  calculateDrawdown,
  calculateFeeComposition,
  calculateSessionPerformance,
  calculateTimeBasedMetrics,
  formatTradesForJournal,
} from '@/lib/calculations';

export async function GET(request: NextRequest) {
  try {
    // Get user from auth (you'll need to add auth middleware)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Optional filters
    const symbol = searchParams.get('symbol');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch trades from Supabase
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_address', userId)
      .order('block_time', { ascending: false });

    // Apply filters
    if (symbol && symbol !== 'all') {
      query = query.eq('instrument_id', symbol);
    }
    if (startDate) {
      query = query.gte('block_time', startDate);
    }
    if (endDate) {
      query = query.lte('block_time', endDate);
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trades' },
        { status: 500 }
      );
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        coreMetrics: calculateCoreMetrics([]),
        longShortRatio: calculateLongShortRatio([]),
        riskMetrics: calculateRiskMetrics([]),
        pnlTimeSeries: [],
        drawdown: calculateDrawdown([]),
        feeComposition: calculateFeeComposition([]),
        sessionPerformance: calculateSessionPerformance([]),
        timeBasedMetrics: calculateTimeBasedMetrics([]),
        trades: [],
      });
    }

    // Calculate all metrics
    const analytics = {
      // For dashboard cards
      coreMetrics: calculateCoreMetrics(trades),
      longShortRatio: calculateLongShortRatio(trades),
      riskMetrics: calculateRiskMetrics(trades),
      
      // For charts
      pnlTimeSeries: generatePnLTimeSeries(trades),
      drawdown: calculateDrawdown(trades),
      feeComposition: calculateFeeComposition(trades),
      sessionPerformance: calculateSessionPerformance(trades),
      
      // For additional analytics
      timeBasedMetrics: calculateTimeBasedMetrics(trades),
      
      // For trade journal
      trades: formatTradesForJournal(trades.slice(0, 100)), // Limit to 100 for performance
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}