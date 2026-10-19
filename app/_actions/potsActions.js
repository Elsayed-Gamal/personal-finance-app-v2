"use server";

import { revalidatePath } from "next/cache";
import {
  addMoneyToPot,
  addPot as addNewPot,
  deletePot as deleteCurrentPot,
  editPot as editCurrentPot,
  withdrawMoneyFromPot,
} from "../_services/apiPots";

async function runMutation(mutate) {
  try {
    await mutate();
  } catch (error) {
    return {
      error: error.message || "Unable to save your changes. Please try again.",
    };
  }
  revalidatePath("/pots");
  revalidatePath("/");
  return { success: true };
}

function potFields(formData) {
  return {
    name: formData.get("potName"),
    target: Number(formData.get("potTarget")),
    theme: formData.get("potTheme"),
  };
}

export async function addMoney(potId, amount) {
  return runMutation(() => addMoneyToPot({ potId, amount }));
}
export async function withdrawMoney(potId, amount) {
  return runMutation(() => withdrawMoneyFromPot({ potId, amount }));
}
export async function addPot(formData) {
  return runMutation(() => addNewPot(potFields(formData)));
}
export async function editPot(potId, formData) {
  return runMutation(() =>
    editCurrentPot({ potId, updatedFields: potFields(formData) }),
  );
}
export async function deletePot(potId) {
  return runMutation(() => deleteCurrentPot(potId));
}
