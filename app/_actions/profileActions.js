"use server";

import {
  updateNameSchema,
  updatePasswordSchema,
} from "@/app/_utils/validationSchemas";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  updateUserName,
  updateUserPassword,
} from "../_services/apiUsers";
import { requireUser } from "../_services/authorization";
import { initializeBalance } from "../_services/apiBalance";
import { revalidatePath } from "next/cache";

export async function updateName(prevState, formData) {
  const raw = {
    name: formData.get("name")?.trim(),
  };

  const user = await requireUser();

  const result = updateNameSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  await updateUserName(user.id, result.data.name);

  return { success: "Name updated successfully.", name: result.data.name };
}

export async function updatePassword(prevState, formData) {
  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const user = await requireUser();

  const result = updatePasswordSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const userFromDB = await getUserByEmail(user.email);

  const isValid = await bcrypt.compare(
    result.data.currentPassword,
    userFromDB.password,
  );

  if (!isValid) {
    return {
      errors: {
        currentPassword: ["Current password is incorrect"],
      },
    };
  }

  const hashedPassword = await bcrypt.hash(result.data.newPassword, 12);

  await updateUserPassword(user.id, hashedPassword);
  return { success: "Password updated successfully." };
}

export async function setOpeningBalance(prevState, formData) {
  const raw = formData.get("openingBalance");
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter your current available balance." };
  }

  try {
    await initializeBalance(Number(raw));
  } catch (error) {
    return { error: error.message || "Unable to set your opening balance." };
  }

  for (const path of ["/profile", "/", "/transactions", "/pots"])
    revalidatePath(path);
  return { success: "Opening balance saved successfully." };
}
