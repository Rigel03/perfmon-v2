'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import {
  Users,
  ClipboardText,
  ChartBar,
  Link as LinkIcon,
  UserGear,
  UploadSimple,
  CheckSquare,
} from '@phosphor-icons/react';

const ADMIN_LINKS = [
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/mfos', label: 'MFO Definitions', icon: ClipboardText },
  { href: '/admin/assignments', label: 'MFO Assignments', icon: LinkIcon },
  { href: '/admin/indicators', label: 'Performance Indicators', icon: ChartBar },
  { href: '/admin/users', label: 'User Accounts', icon: UserGear },
  { href: '/admin/review', label: 'Review Submissions', icon: CheckSquare },
  { href: '/admin/import', label: 'Bulk Import', icon: UploadSimple },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Administration Console
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            Manage division personnel, MFO & PI definitions, quarterly targets, and user roles
          </p>
        </div>

        {/* Admin Navigation Pills Bar */}
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          background: 'var(--color-card-bg)',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href === '/admin/employees' && pathname === '/admin');
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: active ? 700 : 600,
                  color: active ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
                  background: active ? 'var(--color-primary)' : 'transparent',
                  border: active ? '1px solid var(--color-primary)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} weight={active ? 'bold' : 'regular'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Content Area */}
        <div style={{ width: '100%' }}>
          {children}
        </div>
      </div>
    </AppShell>
  );
}
