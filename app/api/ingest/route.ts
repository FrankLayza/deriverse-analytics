import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

import { fetchMyTrades } from "@/lib/fetch-trade";

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
    console.log("starting ingesting");
    const parsedTrades = await fetchMyTrades(wallet);

    if (!parsedTrades) {
      return NextResponse.json(
        {
          message: "No new trades found",
          inserted: 0,
        },
        { status: 200 },
      );
    }
    console.log(`Found ${parsedTrades.length} trades`);
    const tradesToInsert = parsedTrades.map((trade: any) => ({
      user_address: wallet,
      transaction_signature: trade.signature,
      block_time: trade.blockTime ? new Date(trade.blockTime).toISOString() : new Date().toISOString(), // Use real block_time if your script grabs it
      instrument_id: trade.instrument_id || 1, // Fallback if your script doesn't grab this yet
      side: trade.side ? trade.side.toLowerCase() : 'buy', // 'BUY' or 'SELL'
      order_type: trade.orderType || "market",
      price: trade.price.toString(), // DB expects string
      quantity: trade.size.toString(), // DB expects string
      quote_amount: (trade.price * trade.size).toString(),
      fees: trade.feeRebates ? trade.feeRebates.toString() : "0",
      realized_pnl: trade.pnl ? trade.pnl.toString() : "0",
      status: "confirmed",
      market_type: "spot", // Or 'PERP' depending on your logic
    }));

    const { data, error } = await supabase
      .from("trades")
      .upsert(tradesToInsert, {
        onConflict: "transaction_signature",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("Supabase Insert Error", error);
      throw error;
    }

    console.log(`Successfully synced data`);

    return NextResponse.json(
      {
        message: "Sync Successful",
        inserted: tradesToInsert.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ingest API error: ", error);
    return NextResponse.json(
      {
        error: "Internal Server error during sync",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
