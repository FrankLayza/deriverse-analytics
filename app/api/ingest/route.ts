import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { fetchMyTrades } from "@/lib/fetch-trade";
import {
  syncLimiter,
  getRateLimitKey,
  getClientIP,
} from "@/lib/middleware/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet not connected" },
        { status: 400 },
      );
    }

    // 🔒 RATE LIMITING: Check if wallet has exceeded sync limit
    const clientIP = getClientIP(request);
    const rateLimitKey = getRateLimitKey(wallet, clientIP);
    const rateLimitResult = syncLimiter.check(rateLimitKey);

    if (!rateLimitResult.allowed) {
      const retryAfterSeconds = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000,
      );

      console.warn(`⛔️ Rate limit exceeded for ${rateLimitKey}`);

      return NextResponse.json(
        {
          error: "Too many sync requests",
          message: `You can sync at most 5 times per 5 minutes. Please try again in ${retryAfterSeconds} seconds.`,
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          },
        },
      );
    }

    console.log(
      `✅ Rate limit OK for ${rateLimitKey} (${rateLimitResult.remaining} requests remaining)`,
    );

    const parsedTrades = await fetchMyTrades(wallet);

    if (!parsedTrades || parsedTrades.length === 0) {
      console.log("⚠️  No new trades found");
      return NextResponse.json(
        {
          message: "No new trades found",
          inserted: 0,
        },
        { status: 200 },
      );
    }

    console.log(`📊 Found ${parsedTrades.length} trades to insert`);

    // Map the decoded trades to Supabase format
    const tradesToInsert = parsedTrades.map((trade: any) => {
      // FIX 1: Properly map fee (it's called 'fee' not 'feeRebates')
      const feeValue = trade.fee || trade.feeRebates || 0;

      // FIX 2: Detect trade type from tag (11 = SPOT, 19 = PERP)
      const marketType = trade.tag === 19 ? "perp" : "spot";

      // FIX 3: Use proper field names from decoded trade
      const mappedTrade = {
        user_address: wallet,
        transaction_signature: trade.signature,
        block_time: trade.blockTime
          ? new Date(trade.blockTime).toISOString()
          : new Date().toISOString(),
        instrument_id: trade.instrumentId || 1,
        side: trade.side ? trade.side.toLowerCase() : "buy",
        order_type: trade.orderType || "market",
        price: trade.price ?? 0,
        quantity: trade.size.toString(),
        quote_amount: (trade.price * trade.size).toString(),
        fees: Math.abs(feeValue).toString(), // Store as positive number
        realized_pnl: trade.pnl ? trade.pnl.toString() : "0",
        status: "confirmed",
        market_type: marketType, // Correctly set based on tag
      };

      // console.log(`  📝 Mapping trade:`, {
      //   signature: trade.signature.substring(0, 16) + "...",
      //   side: mappedTrade.side,
      //   type: marketType,
      //   price: mappedTrade.price,
      //   size: mappedTrade.quantity,
      //   fee: mappedTrade.fees,
      // });

      return mappedTrade;
    });

    const { data, error } = await supabase
      .from("trades")
      .upsert(tradesToInsert, {
        onConflict: "transaction_signature",
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      throw error;
    }

    const insertedCount = data?.length || 0;
    console.log(`✅ Successfully synced ${insertedCount} trades`);

    return NextResponse.json(
      {
        message: "Sync Successful",
        inserted: insertedCount,
        totalProcessed: tradesToInsert.length,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Ingest API error:", error);
    return NextResponse.json(
      {
        error: "Internal Server error during sync",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
