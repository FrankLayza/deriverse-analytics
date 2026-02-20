import { supabase, type Trade } from "@/utils/supabase";

// 1. READ: Fetches raw trades from Supabase
// Corresponds to 'getTodos'
export async function getTrades(wallet: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_address", wallet)
    .order("block_time", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Trade[]) || [];
}

// 2. WRITE: Calls your /api/ingest route
// Corresponds to 'postTodo'
export async function triggerSync(wallet: string) {
  const response = await fetch("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });

  if (!response.ok) {
    const error = await response.json();

    // Handle rate limiting (429)
    if (response.status === 429) {
      throw new Error(
        error.message ||
          `Too many sync requests. Please wait a few moments and try again.`,
      );
    }

    throw new Error(error.message || "Sync failed");
  }

  return response.json();
}
