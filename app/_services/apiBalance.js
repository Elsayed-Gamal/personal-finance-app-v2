import supabase from "./supabase";

export async function getBalance() {
  const { data: balance, error } = await supabase
    .from("balance_snapshots")
    .select("current")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return balance.current;
}

export async function updateBalance(newBalance) {
  const { data: newBalanceData, error } = await supabase
    .from("balance_snapshots")
    .update({ current: newBalance })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return newBalanceData;
}
