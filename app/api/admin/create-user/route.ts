import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'employee']),
  employeeId: z.string().nullable().optional(),
  displayName: z.string().optional(),
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
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const { email, password, role, employeeId, displayName } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration: Service role key missing' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: newAuthUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: password || '123456',
      email_confirm: true,
      user_metadata: { role, displayName: displayName || '' },
    });

    if (authError || !newAuthUser?.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 400 });
    }

    const uid = newAuthUser.user.id;

    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: uid,
      email,
      role,
      employee_id: employeeId || null,
      display_name: displayName || '',
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return NextResponse.json({ success: true, uid });
  } catch (err: any) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
