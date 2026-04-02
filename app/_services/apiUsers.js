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
    .select('id, name, email, role')
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

export async function updateUserName(userId, newName) {
  const { error } = await supabase
    .from('users')
    .update({ name: newName })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user name:', error);
    throw new Error('Failed to update user name');
  }
}

export async function updateUserPassword(userId, newPassword) {
  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user password:', error);
    throw new Error('Failed to update user password');
  }
}
