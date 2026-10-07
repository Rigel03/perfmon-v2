import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateUserSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'employee']).optional(),
  employeeId: z.string().nullable().optional(),
  displayName: z.string().optional(),
  avatarId: z.string().optional(),
  gender: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const { uid, email, password, role, employeeId, displayName, avatarId, gender } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration: Service role key missing' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Update Auth user if email, password, or user_metadata changed
    const authUpdatePayload: any = {};
    if (email) authUpdatePayload.email = email;
    if (password && password.trim().length > 0) authUpdatePayload.password = password;

    const metadataUpdate: any = {};
    if (role) metadataUpdate.role = role;
    if (displayName !== undefined) metadataUpdate.displayName = displayName;
    if (avatarId !== undefined) metadataUpdate.avatar_id = avatarId;
    if (gender !== undefined) metadataUpdate.gender = gender;

    if (Object.keys(metadataUpdate).length > 0) {
      const { data: existingUser } = await adminClient.auth.admin.getUserById(uid);
      authUpdatePayload.user_metadata = {
        ...(existingUser?.user?.user_metadata || {}),
        ...metadataUpdate,
      };
    }

    if (Object.keys(authUpdatePayload).length > 0) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(uid, authUpdatePayload);
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    // 2. Update profiles table
    const profileUpdate: any = { updated_at: new Date().toISOString() };
    if (email) profileUpdate.email = email;
    if (role) profileUpdate.role = role;
    if (employeeId !== undefined) profileUpdate.employee_id = employeeId;
    if (displayName !== undefined) profileUpdate.display_name = displayName;

    const { error: profileError } = await adminClient
      .from('profiles')
      .update(profileUpdate)
      .eq('id', uid);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
