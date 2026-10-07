import { getSupabaseClient } from '../supabase/client';
import type { Profile } from '@/types';

export async function createUser({
  email,
  password,
  role,
  employeeId,
  displayName,
}: {
  email: string;
  password?: string;
  role: string;
  employeeId?: string | null;
  displayName?: string;
}): Promise<string> {
  const response = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, employeeId, displayName }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create user');
  }

  return data.uid;
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, display_name, employee_id, created_at');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  const users: Profile[] = (data || []).map((d: any) => ({
    uid: d.id,
    email: d.email,
    role: d.role,
    displayName: d.display_name,
    employeeId: d.employee_id,
    createdAt: d.created_at,
  }));

  return users.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
}

export async function updateUserProfile(
  uid: string,
  profileData: { displayName?: string; employeeId?: string | null; role?: 'admin' | 'employee' }
): Promise<void> {
  const supabase = getSupabaseClient();
  const updateData: any = { updated_at: new Date().toISOString() };
  if (profileData.displayName !== undefined) updateData.display_name = profileData.displayName;
  if (profileData.employeeId !== undefined) updateData.employee_id = profileData.employeeId;
  if (profileData.role !== undefined) updateData.role = profileData.role;

  const { error } = await supabase.from('profiles').update(updateData).eq('id', uid);
  if (error) throw error;
}

export async function adminUpdateUser(payload: {
  uid: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'employee';
  employeeId?: string | null;
  displayName?: string;
}): Promise<void> {
  const response = await fetch('/api/admin/update-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update user account');
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  const response = await fetch('/api/admin/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete user account');
  }
}
