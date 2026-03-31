import supabase from './supabase';

export async function createUser(userData) {
  const { error } = await supabase.from('users').insert(userData);

  if (error) {
    console.error('Error adding user:', error);
    throw new Error('Failed to add user');
  }
}

export async function getUserByEmailForVerification(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  return data;
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Failed to fetch user');
  }

  return data;
}
