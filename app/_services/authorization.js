import "server-only";
import { auth } from "./auth";
import supabase from "./supabase";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error)
    throw new Error("Unable to verify your account. Please try again.");
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
