'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  ClipboardText,
  ChartBar,
  ChartLineUp,
  User,
  Gear,
} from '@phosphor-icons/react';
import type { Profile } from '@/types';

interface BottomNavProps {
  user: Profile | null;
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const empType = user?.employmentType;

  const navLinks = [
    { href: '/home', label: 'Home', icon: House, show: true },
    { href: '/my-ipcr', label: 'IPCR', icon: ClipboardText, show: isAdmin || empType === 'plantilla' },
    { href: '/tracker', label: 'Tracker', icon: ChartBar, show: isAdmin || empType === 'jo_cos' },
    { href: '/dashboard', label: 'Analytics', icon: ChartLineUp, show: isAdmin || empType === 'plantilla' },
    { href: '/profile', label: 'Profile', icon: User, show: true },
    { href: '/admin', label: 'Admin', icon: Gear, show: isAdmin },
  ].filter(l => l.show);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md safe-area-pb">
      <div className="flex items-center justify-around h-15 px-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 text-[10px] font-semibold transition-colors ${
                active
                  ? 'text-amber-500 dark:text-amber-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={20} weight={active ? 'fill' : 'regular'} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
