import { getBalance, updateBalance } from "./apiBalance";
import supabase from "./supabase";

export async function getPots() {
  const { data: pots, error } = await supabase
    .from("pots")
    .select("name, target, total, theme");

  if (error) {
    throw new Error(error.message);
  }

  return pots;
}

export async function getPotDetails(potName) {
  const { data: potDetails, error } = await supabase
    .from("pots")
    .select("name, target, total, theme")
    .eq("name", potName);

  if (error) {
    throw new Error(error.message);
  }

  return potDetails[0];
}

export async function addPot(pot) {
  const { data, error } = await supabase.from("pots").insert([pot]).select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function editPot({ potName, updatedFields }) {
  const { data, error } = await supabase
    .from("pots")
    .update(updatedFields)
    .eq("name", potName)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deletePot(potName) {
  const { total } = await getPotDetails(potName);
  const balance = await getBalance();

  await updateBalance(balance + total);

  const { error } = await supabase.from("pots").delete().eq("name", potName);

  if (error) {
    throw new Error(error.message);
  }
}

export async function addMoneyToPot({ potName, amount }) {
  const { total, target } = await getPotDetails(potName);
  const balance = await getBalance();
  const newTotal = total + amount;

  if (amount > balance) {
    throw new Error("Insufficient balance to add this amount to the pot.");
  }

  if (newTotal > target) {
    throw new Error("Adding this amount exceeds the pot's target.");
  }

  const { error } = await supabase
    .from("pots")
    .update({ total: newTotal })
    .eq("name", potName);

  await updateBalance(balance - amount);

  if (error) {
    throw new Error(error.message);
  }
}

export async function withdrawMoneyFromPot({ potName, amount }) {
  const { total } = await getPotDetails(potName);
  const balance = await getBalance();
  const newTotal = total - amount;

  if (amount > total) {
    throw new Error("Insufficient funds in the pot to withdraw this amount.");
  }

  if (newTotal < 0) {
    throw new Error(
      "Withdrawing this amount would make the pot total negative.",
    );
  }

  const { error } = await supabase
    .from("pots")
    .update({ total: newTotal })
    .eq("name", potName);

  await updateBalance(balance + amount);

  if (error) {
    throw new Error(error.message);
  }
}
