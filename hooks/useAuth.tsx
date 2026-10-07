'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, logoutUser } from '@/lib/auth';
import type { Profile } from '@/types';

interface AuthContextType {
  user: Profile | null | undefined;
  setUser: (u: Profile | null) => void;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  setUser: () => {},
  logoutUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthChange((u: any) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
