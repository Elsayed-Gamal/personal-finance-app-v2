import supabase from './supabase';

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }

  return data;
}

export async function adminUpdateUser(userId, updates) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

export async function adminDeleteUser(userId) {
  const { error } = await supabase.from('users').delete().eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

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
