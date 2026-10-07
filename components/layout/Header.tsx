'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  House,
  ClipboardText,
  ChartBar,
  ChartLineUp,
  User,
  Gear,
  SignOut,
} from '@phosphor-icons/react';
import type { Profile } from '@/types';

interface HeaderProps {
  user: Profile | null;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutUser } = useAuth();

  const isAdmin = user?.role === 'admin';
  const empType = user?.employmentType;

  async function handleLogout() {
    await logoutUser();
    router.push('/login');
  }

  const navLinks = [
    { href: '/home', label: 'Home', icon: House, show: true },
    { href: '/my-ipcr', label: 'My IPCR', icon: ClipboardText, show: isAdmin || empType === 'plantilla' },
    { href: '/tracker', label: 'Tracker', icon: ChartBar, show: isAdmin || empType === 'jo_cos' },
    { href: '/dashboard', label: 'Analytics', icon: ChartLineUp, show: isAdmin || empType === 'plantilla' },
    { href: '/profile', label: 'Profile', icon: User, show: true },
    { href: '/admin', label: 'Admin', icon: Gear, show: isAdmin },
  ].filter((l) => l.show);

  return (
    <header className="app-header">
      {/* Top Identity Row */}
      <div className="header-top">
        <Link href="/home" className="header-brand">
          <div className="header-logo-wrap">
            <Image
              src="/logo.jpg"
              alt="CTTMO Logo"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="header-titles">
            <span className="header-agency">City Transport and Traffic Management Office</span>
            <span className="header-division">Transport Planning and Management Division</span>
            <span className="header-app-title">PerfMon</span>
          </div>
        </Link>

        {/* User Info & Quick Logout */}
        {user && (
          <div className="header-user-area">
            <div className="header-user-info">
              <span className="header-user-name">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="badge badge-admin">
                {user.role?.toUpperCase()}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              title="Sign Out"
            >
              <SignOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="header-nav-bar">
        <div className="header-nav-inner">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`header-nav-link ${active ? 'active' : ''}`}
              >
                <Icon size={16} weight={active ? 'bold' : 'regular'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
