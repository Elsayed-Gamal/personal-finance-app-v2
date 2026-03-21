import supabase from "./supabase";

export async function getCategories() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("name");

  if (error) {
    throw new Error(error.message);
  }

  return categories;
}
