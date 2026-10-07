'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  House,
  ClipboardText,
  ChartBar,
  ChartLineUp,
  User,
  Gear,
  Users,
  CheckSquare,
  UploadSimple,
  Link as LinkIcon,
  X,
} from '@phosphor-icons/react';
import { getAvatarById } from '@/lib/avatars';
import type { Profile } from '@/types';

interface SidebarProps {
  user: Profile | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const empType = user?.employmentType;

  const mainLinks = [
    { href: '/home', label: 'Dashboard', icon: House, show: true },
    { href: '/my-ipcr', label: 'My IPCR', icon: ClipboardText, show: isAdmin || empType === 'plantilla' },
    { href: '/tracker', label: 'Tracker', icon: ChartBar, show: isAdmin || empType === 'jo_cos' },
    { href: '/dashboard', label: 'Analytics', icon: ChartLineUp, show: isAdmin || empType === 'plantilla' },
    { href: '/profile', label: 'Profile', icon: User, show: true },
  ].filter((l) => l.show);

  const adminLinks = [
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/mfos', label: 'MFO Definitions', icon: ClipboardText },
    { href: '/admin/assignments', label: 'MFO Assignments', icon: LinkIcon },
    { href: '/admin/indicators', label: 'PI Definitions', icon: ChartBar },
    { href: '/admin/users', label: 'User Accounts', icon: Gear },
    { href: '/admin/review', label: 'Review Submissions', icon: CheckSquare },
    { href: '/admin/import', label: 'Bulk Import', icon: UploadSimple },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sidebar-logo">
            <Image
              src="/logo.jpg"
              alt="CTTMO Logo"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-app-title">
              <span>PERFMON</span>
              <span className="sidebar-app-badge">IPCR</span>
            </div>
            <span className="sidebar-agency-text">CTTMO · TPMD</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="sidebar-close-btn"
          title="Close Navigation"
          aria-label="Close navigation sidebar"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {/* Nav Content */}
      <div className="sidebar-nav-section">
        {/* Main Section */}
        <div>
          <div className="sidebar-group-title">Main</div>
          <div className="sidebar-nav-list">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                >
                  <Icon size={18} weight={active ? 'bold' : 'regular'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div>
            <div className="sidebar-group-title">Administration</div>
            <div className="sidebar-nav-list">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href || (link.href === '/admin/employees' && pathname === '/admin');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  >
                    <Icon size={18} weight={active ? 'bold' : 'regular'} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      {user && (() => {
        const avatar = getAvatarById(user.avatarId);
        const SvgIcon = avatar.SvgComponent;
        return (
          <Link
            href="/profile"
            onClick={onClose}
            className="sidebar-user-footer"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
            title="Go to My Profile"
          >
            <div
              className="sidebar-user-avatar"
              style={{
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SvgIcon size={26} color={avatar.color} />
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="sidebar-user-role">
                {user.role === 'admin' ? 'Super Admin' : empType === 'jo_cos' ? 'JO/COS Officer' : 'Plantilla Officer'}
              </span>
            </div>
          </Link>
        );
      })()}
    </aside>
  );
}
