'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ user, children }: { user: User | null; children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
