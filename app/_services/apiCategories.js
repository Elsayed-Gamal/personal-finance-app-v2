import supabase from "./supabase";

export async function getCategories() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, theme")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return categories;
}
