import { address } from "@solana/kit";

export const mapEventToSchema = (event: any, signature: string, wallet: string, blockTime: Date) => {
  // Deriverse: 0 = BUY, 1 = SELL
  const side = event.side === 0 ? 'buy' : 'sell';
  
  // Tag 11 is Spot, Tag 19 is Perp
  const marketType = (event.tag === 11) ? 'spot' : 'perp';
  
  const price = Number(event.price || 0);
  
  // Normalize raw units (1e9) to decimals
  const quantity = Number(event.qty || event.perps || 0) / 1e9;
  const quote_amount = price * quantity;
  
  // Fees: 'rebates' in the log are negative fees. 
  // We store them as a positive decimal for easy summing.
  const fees = event.rebates ? Math.abs(Number(event.rebates) / 1e9) : 0;

  return {
    user_address: wallet,
    transaction_signature: signature,
    block_time: blockTime.toISOString(),
    instrument_id: event.instrId || 0,
    side: side,
    market_type: marketType,
    price: price,
    quantity: quantity,
    quote_amount: quote_amount,
    fees: fees,
    status: 'filled',
    // For perps, Tag 19 often contains pnl
    realized_pnl: event.pnl ? Number(event.pnl) / 1e9 : 0 
  };
};