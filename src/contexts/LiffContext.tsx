'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Liff } from '@line/liff';
import { UserProfile } from '@/types';
import { mockCurrentUser } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface LiffContextType {
  liff: Liff | null;
  profile: UserProfile | null;
  lineProfile: { userId: string; displayName: string; pictureUrl?: string } | null;
  isLoggedIn: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
  refetchProfile: () => Promise<void>;
  updateRole: (newRole: UserProfile['role']) => void;
  loginWithLine: () => void;
  loginWithCredentials: (user: string, pass: string) => boolean;
  switchProfile: (user: UserProfile) => void;
  logout: () => void;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  profile: null,
  lineProfile: null,
  isLoggedIn: false,
  isRegistered: false,
  isLoading: true,
  error: null,
  isMockMode: true,
  refetchProfile: async () => {},
  updateRole: () => {},
  loginWithLine: () => {},
  loginWithCredentials: () => false,
  switchProfile: () => {},
  logout: () => {},
});

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [lineProfile, setLineProfile] = useState<{ userId: string; displayName: string; pictureUrl?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  // Check saved session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yfti_auth_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.display_name) {
            setProfile(parsed);
            setIsRegistered(true);
          }
        } catch (e) {
          localStorage.removeItem('yfti_auth_session');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const loginWithCredentials = (user: string, pass: string): boolean => {
    const trimmedUser = user.trim();
    const trimmedPass = pass.trim();

    if (
      (trimmedUser.toLowerCase() === 'yfti11' && trimmedPass === 'yfti@11') ||
      (trimmedUser === 'YFTI Admin' && trimmedPass === '(XM8zvGei1l$XaHc&nT$oqs&')
    ) {
      const authUser: UserProfile = {
        ...mockCurrentUser,
        display_name: trimmedUser === 'YFTI Admin' ? 'YFTI Admin' : 'พงศ์พิชาญ ธนสิริพูนสิน (Golf)',
        role: trimmedUser === 'YFTI Admin' ? 'SUPER_ADMIN' : 'MEMBER',
      };
      setProfile(authUser);
      setIsRegistered(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_auth_session', JSON.stringify(authUser));
      }
      return true;
    }
    return false;
  };

  const switchProfile = (user: UserProfile) => {
    setProfile(user);
    setIsRegistered(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yfti_auth_session', JSON.stringify(user));
    }
  };

  const updateRole = (newRole: UserProfile['role']) => {
    if (profile) {
      const updated = { ...profile, role: newRole };
      setProfile(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_auth_session', JSON.stringify(updated));
      }
    }
  };

  const logout = () => {
    setProfile(null);
    setLineProfile(null);
    setIsRegistered(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yfti_auth_session');
    }
  };

  const loginWithLine = () => {
    if (liffObject) {
      liffObject.login();
    } else {
      alert('LINE LIFF เชื่อมต่ออัตโนมัติเมื่อเปิดผ่านแอปพลิเคชัน LINE');
    }
  };

  const refetchProfile = async () => {};

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        profile,
        lineProfile,
        isLoggedIn: Boolean(profile),
        isRegistered,
        isLoading,
        error,
        isMockMode,
        refetchProfile,
        updateRole,
        loginWithLine,
        loginWithCredentials,
        switchProfile,
        logout,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
};

export const useLiffAuth = () => useContext(LiffContext);
