"use server";
import { saveBudget } from "../_services/apiBudgets";
import { runFinancialMutation } from "../_services/financialMutation";

function fields(formData) {
  return {
    category_id: formData.get("category_id"),
    maximum: Number(formData.get("maximum")),
    theme: formData.get("theme"),
  };
}
export async function createBudget(id, formData) {
  return runFinancialMutation(() => saveBudget("create", id, fields(formData)));
}
export async function editBudget(id, formData) {
  return runFinancialMutation(() => saveBudget("edit", id, fields(formData)));
}
export async function deleteBudget(id) {
  return runFinancialMutation(() => saveBudget("delete", id));
}
