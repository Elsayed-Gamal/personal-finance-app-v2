import supabase from './supabase';

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error(`Error fetching setting "${key}":`, error);
    return null;
  }

  return data?.value ?? null;
}

export async function setSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: String(value) });

  if (error) {
    console.error(`Error updating setting "${key}":`, error);
    throw new Error(`Failed to update setting "${key}"`);
  }
}

export async function isRegistrationOpen() {
  const value = await getSetting('registration_open');
  return value === 'true';
}
