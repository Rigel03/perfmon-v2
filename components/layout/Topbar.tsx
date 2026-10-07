'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  Moon,
  Sun,
  SignOut,
  List,
  CaretRight,
} from '@phosphor-icons/react';
import type { Profile } from '@/types';

interface TopbarProps {
  user: Profile | null;
  onOpenMobileMenu?: () => void;
  onToggleMenu?: () => void;
}

const PAGE_NAMES: Record<string, string> = {
  '/home': 'Dashboard',
  '/my-ipcr': 'My IPCR Commitments',
  '/tracker': 'Performance Tracker',
  '/dashboard': 'Analytics & Reporting',
  '/profile': 'Officer Profile',
  '/admin': 'Administration Console',
  '/admin/employees': 'Personnel Roster',
  '/admin/mfos': 'MFO Definitions',
  '/admin/assignments': 'MFO Assignments',
  '/admin/indicators': 'PI Definitions',
  '/admin/users': 'User Accounts',
  '/admin/review': 'Review Submissions',
  '/admin/import': 'Bulk Import',
};

export default function Topbar({ user, onOpenMobileMenu, onToggleMenu }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    await logoutUser();
    router.push('/login');
  }

  const currentPage = PAGE_NAMES[pathname] || 'Dashboard';

  return (
    <header className="app-topbar">
      {/* Breadcrumb Area with Working Hamburger */}
      <div className="topbar-breadcrumbs">
        <button
          type="button"
          onClick={onToggleMenu || onOpenMobileMenu}
          className="btn-hamburger"
          title="Toggle Navigation"
          aria-label="Toggle navigation sidebar"
        >
          <List size={20} weight="bold" />
        </button>
        <span>CTTMO · TPMD</span>
        <CaretRight size={12} color="var(--color-text-muted)" />
        <span className="topbar-breadcrumb-active">{currentPage}</span>
      </div>

      {/* Actions (Dark Mode Toggle & Sign Out) */}
      <div className="topbar-actions">
        <button
          onClick={toggleTheme}
          className="btn btn-outline btn-sm"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ gap: 6 }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#facc15" weight="bold" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#0284c7" weight="bold" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          title="Sign Out"
          style={{ gap: 6, color: 'var(--color-danger)' }}
        >
          <SignOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
