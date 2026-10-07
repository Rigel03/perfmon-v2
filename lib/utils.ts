import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Quarter, RecordStatus, StatusConfig } from '@/types';

// ─── cn utility ───────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Quarter helpers ──────────────────────────────────────────────────────────
export const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
export const QUARTER_MONTHS: Record<Quarter, number[]> = {
  Q1: [0, 1, 2],
  Q2: [3, 4, 5],
  Q3: [6, 7, 8],
  Q4: [9, 10, 11],
};
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function getCurrentQuarter(): Quarter {
  const m = new Date().getMonth();
  if (m < 3) return 'Q1';
  if (m < 6) return 'Q2';
  if (m < 9) return 'Q3';
  return 'Q4';
}

/** Returns [currentYear - 2 … currentYear + 1] */
export function getYearRange(): number[] {
  const cur = new Date().getFullYear();
  return [cur - 2, cur - 1, cur, cur + 1];
}

// ─── Status config ────────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<RecordStatus, StatusConfig> = {
  'Accomplished': {
    label: 'Accomplished',
    badge: 'badge-accomplished',
    dot: '#15803d',
    bg: '#dcfce7',
    text: '#15803d',
  },
  'Partial': {
    label: 'Partial',
    badge: 'badge-partial',
    dot: '#854d0e',
    bg: '#fef9c3',
    text: '#854d0e',
  },
  'Deferred': {
    label: 'Deferred',
    badge: 'badge-deferred',
    dot: '#b91c1c',
    bg: '#fee2e2',
    text: '#b91c1c',
  },
  'Pending': {
    label: 'Pending',
    badge: 'badge-pending',
    dot: '#1d4ed8',
    bg: '#dbeafe',
    text: '#1d4ed8',
  },
  'Not Started': {
    label: 'Not Started',
    badge: 'badge-notstarted',
    dot: '#71717a',
    bg: '#f4f4f5',
    text: '#71717a',
  },
};

// ─── Rate calculation ─────────────────────────────────────────────────────────
export function calcRate(accomplished: number, total: number): number {
  return total > 0 ? Math.round((accomplished / total) * 100) : 0;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Initials helper ──────────────────────────────────────────────────────────
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name || email?.split('@')[0] || '?';
  return source
    .split(/[\s_-]+/)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Color seed for avatar ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-amber-500', 'bg-emerald-600', 'bg-blue-600',
  'bg-violet-600', 'bg-rose-600', 'bg-cyan-600', 'bg-orange-500',
];
export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
