import { getSupabaseClient, isSupabaseConfigured } from './supabase/client';
import type { Profile } from '@/types';

/**
 * Sign in with email and password.
 */
export async function loginUser(email: string, password: string): Promise<Profile> {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user) {
    throw error || new Error('Authentication failed');
  }

  const profile = await getUserProfile(user.id);
  return { uid: user.id, email: user.email || '', ...profile };
}

/**
 * Sign out the current user.
 */
export async function logoutUser(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Get user profile from Supabase profiles table.
 */
export async function getUserProfile(uid: string): Promise<{
  role: 'admin' | 'employee';
  employeeId: string | null;
  displayName: string;
  avatarId?: string;
  gender?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { role: 'employee', employeeId: null, displayName: '' };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) {
      return { role: 'employee', employeeId: null, displayName: '' };
    }

    return {
      role: data.role || 'employee',
      employeeId: data.employee_id || null,
      displayName: data.display_name || '',
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return { role: 'employee', employeeId: null, displayName: '' };
  }
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(cb: (user: Profile | null) => void): () => void {
  if (!isSupabaseConfigured()) {
    cb(null);
    return () => {};
  }

  const supabase = getSupabaseClient();
  let isMounted = true;

  async function handleSession(session: any) {
    if (!isMounted) return;
    if (session?.user) {
      try {
        const user = session.user;
        const profile = await getUserProfile(user.id);
        const meta = user.user_metadata || {};
        let employmentType = null;

        if (profile.employeeId) {
          try {
            const { data: empData } = await supabase
              .from('employees')
              .select('employment_type')
              .eq('id', profile.employeeId)
              .single();

            if (empData) employmentType = empData.employment_type || 'plantilla';
          } catch (_) {}
        }
        if (isMounted) {
          cb({
            uid: user.id,
            email: user.email || '',
            ...profile,
            avatarId: meta.avatar_id || profile.avatarId || 'joyful',
            gender: meta.gender || profile.gender || '',
            employmentType,
          });
        }
      } catch (err) {
        console.error('Error handling session:', err);
        if (isMounted) cb(null);
      }
    } else {
      if (isMounted) cb(null);
    }
  }

  supabase.auth.getSession().then(({ data: { session } }) => {
    handleSession(session);
  }).catch(() => {
    if (isMounted) cb(null);
  });

  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') return;
    handleSession(session);
  });

  return () => {
    isMounted = false;
    authListener?.subscription.unsubscribe();
  };
}
