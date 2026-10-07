'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div className="spinner" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Loading PerfMon...
        </span>
      </div>
    );
  }

  if (!user) return null;

  const handleToggleMenu = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={`app-layout-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 45,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Viewport */}
      <div className="app-main-viewport">
        <Topbar
          user={user}
          onToggleMenu={handleToggleMenu}
          onOpenMobileMenu={handleToggleMenu}
        />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
