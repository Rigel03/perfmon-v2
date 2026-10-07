import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/client';

const PUBLIC_PATHS = ['/login'];
const ADMIN_PATHS = ['/admin'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  // If env vars are completely absent, allow login page to render without crashing
  const isDefaultOrMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    url.includes('placeholder-project');

  const path = request.nextUrl.pathname;

  if (isDefaultOrMissing) {
    if (!PUBLIC_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Unauthenticated → login
    if (!user && !PUBLIC_PATHS.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Authenticated + on login → home
    if (user && path.startsWith('/login')) {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // Root → home
    if (user && path === '/') {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // Admin guard
    if (user && ADMIN_PATHS.some((p) => path.startsWith(p))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
  } catch (err) {
    console.error('Middleware auth check error:', err);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|logo.jpg|manifest.json|sw.js|workbox-).*)',
  ],
};
