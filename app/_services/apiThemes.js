import supabase from './supabase';

export async function getThemes() {
  const { data: themes, error } = await supabase
    .from('themes')
    .select('color, hex_code');

  if (error) {
    throw new Error(error.message);
  }

  return themes;
}
