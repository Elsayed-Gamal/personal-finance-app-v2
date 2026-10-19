import "server-only";
import { requireUser } from "./authorization";
import supabase from "./supabase";
import { monthRange } from "../_utils/financialDates";

export async function getOverview(month) {
  const user = await requireUser();
  const period = monthRange(month);
  const { data, error } = await supabase.rpc("get_owned_overview_summary", {
    p_user_id: user.id,
    p_start: period.start,
    p_end: period.end,
  });
  if (error || !data)
    throw new Error("Unable to load your overview. Please try again.");
  return data;
}
