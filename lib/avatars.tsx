import React from 'react';

export interface FlatMoodAvatar {
  id: string;
  label: string;
  color: string;
  SvgComponent: React.FC<{ size?: number; color?: string }>;
}

export const FLAT_MOOD_AVATARS: FlatMoodAvatar[] = [
  {
    id: 'rad',
    label: 'Radiant',
    color: '#10b981',
    SvgComponent: ({ size = 32, color = '#10b981' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Star Eyes */}
        <polygon points="17,14 18.5,18.5 23,18.5 19.5,21.5 21,26 17,23 13,26 14.5,21.5 11,18.5 15.5,18.5" fill={color} stroke="none" transform="translate(-1, 0) scale(0.9)" />
        <polygon points="31,14 32.5,18.5 37,18.5 33.5,21.5 35,26 31,23 27,26 28.5,21.5 25,18.5 29.5,18.5" fill={color} stroke="none" transform="translate(1, 0) scale(0.9)" />
        {/* Big Open Smile */}
        <path d="M15 28 C15 35, 33 35, 33 28 Z" fill={color} />
      </svg>
    ),
  },
  {
    id: 'joyful',
    label: 'Joyful',
    color: '#0284c7',
    SvgComponent: ({ size = 32, color = '#0284c7' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Arch Laughing Eyes */}
        <path d="M14 19 Q 18 14 22 19" />
        <path d="M26 19 Q 30 14 34 19" />
        {/* Open Grin */}
        <path d="M15 26 C15 36, 33 36, 33 26 Z" fill={color} />
      </svg>
    ),
  },
  {
    id: 'good',
    label: 'Good',
    color: '#059669',
    SvgComponent: ({ size = 32, color = '#059669' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Dot Eyes */}
        <circle cx="17" cy="18" r="2.5" fill={color} stroke="none" />
        <circle cx="31" cy="18" r="2.5" fill={color} stroke="none" />
        {/* Sweet Curved Smile */}
        <path d="M15 26 Q 24 35 33 26" />
      </svg>
    ),
  },
  {
    id: 'proud',
    label: 'Proud',
    color: '#d97706',
    SvgComponent: ({ size = 32, color = '#d97706' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Cool Sunglasses */}
        <path d="M11 18 H 37 L 34 24 H 14 Z" fill={color} />
        <line x1="22" y1="18" x2="26" y2="18" strokeWidth="3" />
        {/* Smug Smile */}
        <path d="M17 30 Q 24 35 31 28" />
      </svg>
    ),
  },
  {
    id: 'grateful',
    label: 'Grateful',
    color: '#ea580c',
    SvgComponent: ({ size = 32, color = '#ea580c' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Happy Crescent Eyes */}
        <path d="M15 19 Q 19 15 23 19" />
        <path d="M25 19 Q 29 15 33 19" />
        {/* Heart on cheek */}
        <path d="M9 25 C9 23, 12 23, 13 25 C14 23, 17 23, 17 25 C17 28, 13 30, 13 30 C13 30, 9 28, 9 25 Z" fill={color} stroke="none" />
        {/* Warm Smile */}
        <path d="M18 28 Q 24 35 30 28" />
      </svg>
    ),
  },
  {
    id: 'blessed',
    label: 'Blessed',
    color: '#e11d48',
    SvgComponent: ({ size = 32, color = '#e11d48' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Floating Halo */}
        <ellipse cx="24" cy="4" rx="11" ry="3" strokeWidth="2.5" />
        <circle cx="24" cy="26" r="18" />
        {/* Peaceful Eyes */}
        <path d="M15 22 Q 19 18 23 22" />
        <path d="M25 22 Q 29 18 33 22" />
        {/* Gentle Smile */}
        <path d="M17 29 Q 24 36 31 29" />
      </svg>
    ),
  },
  {
    id: 'energetic',
    label: 'Energetic',
    color: '#ca8a04',
    SvgComponent: ({ size = 32, color = '#ca8a04' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Lightning Bolt Eye Accent */}
        <polygon points="19,13 14,21 18,21 15,26 22,17 18,17" fill={color} stroke="none" />
        <polygon points="33,13 28,21 32,21 29,26 36,17 32,17" fill={color} stroke="none" />
        {/* Cheerful Open Grin */}
        <path d="M16 29 C16 36, 32 36, 32 29 Z" fill={color} />
      </svg>
    ),
  },
  {
    id: 'calm',
    label: 'Serene',
    color: '#0d9488',
    SvgComponent: ({ size = 32, color = '#0d9488' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Closed Zen Eyes */}
        <path d="M14 20 Q 18 23 22 20" />
        <path d="M26 20 Q 30 23 34 20" />
        {/* Serene Calm Smile */}
        <path d="M18 27 Q 24 32 30 27" />
      </svg>
    ),
  },
  {
    id: 'motivated',
    label: 'Motivated',
    color: '#2563eb',
    SvgComponent: ({ size = 32, color = '#2563eb' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Focused Determined Eyebrows & Eyes */}
        <line x1="13" y1="15" x2="21" y2="17" strokeWidth="2.5" />
        <line x1="35" y1="15" x2="27" y2="17" strokeWidth="2.5" />
        <circle cx="17" cy="21" r="2.5" fill={color} stroke="none" />
        <circle cx="31" cy="21" r="2.5" fill={color} stroke="none" />
        {/* Determined Confident Smile */}
        <path d="M16 28 Q 24 35 32 28" />
      </svg>
    ),
  },
  {
    id: 'inspired',
    label: 'Inspired',
    color: '#4f46e5',
    SvgComponent: ({ size = 32, color = '#4f46e5' }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        {/* Sparkle Eyes */}
        <path d="M18 14 L19 18 L23 19 L19 20 L18 24 L17 20 L13 19 L17 18 Z" fill={color} stroke="none" />
        <path d="M30 14 L31 18 L35 19 L31 20 L30 24 L29 20 L25 19 L29 18 Z" fill={color} stroke="none" />
        {/* Delighted Smile */}
        <path d="M16 27 C16 34, 32 34, 32 27 Z" fill={color} />
      </svg>
    ),
  },
];

export function getAvatarById(id?: string): FlatMoodAvatar {
  const found = FLAT_MOOD_AVATARS.find((a) => a.id === id);
  return found || FLAT_MOOD_AVATARS[1]; // default 'joyful'
}
