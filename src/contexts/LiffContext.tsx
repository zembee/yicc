'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

const REAL_LINE_USER_ID_RE = /^U[0-9a-f]{32}$/i;

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [lineProfile, setLineProfile] = useState<{ userId: string; displayName: string; pictureUrl?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  const syncLineRichMenu = useCallback((lineUserId: string | undefined, action: 'link' | 'unlink') => {
    if (!lineUserId || !REAL_LINE_USER_ID_RE.test(lineUserId)) return;
    fetch('/api/line/richmenu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineUserId, action }),
    }).catch(() => {});
  }, []);

  const syncProfileFromSupabase = useCallback(
    async (lineUserId: string): Promise<UserProfile | null> => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('*, house:houses(*)')
          .eq('line_user_id', lineUserId)
          .maybeSingle();

        if (!fetchErr && data && data.display_name) {
          return data as UserProfile;
        }
      } catch {
        // Ignore Supabase fallback errors in local/offline mode
      }
      return null;
    },
    []
  );

  // Restore saved session and initialize LINE LIFF
  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      let savedProfile: UserProfile | null = null;

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('yfti_auth_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as UserProfile;
            if (parsed && parsed.display_name) {
              savedProfile = parsed;
              if (!cancelled) {
                setProfile(parsed);
                setIsRegistered(true);
              }
              if (parsed.role !== 'PENDING' && parsed.approval_status !== 'PENDING') {
                syncLineRichMenu(parsed.line_user_id, 'link');
              }
            }
          } catch {
            localStorage.removeItem('yfti_auth_session');
          }
        }
      }

      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId || liffId === 'mock-liff-id' || liffId === 'your-line-liff-id-here') {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const liffModule = (await import('@line/liff')).default;
        await liffModule.init({ liffId });
        if (cancelled) return;

        setLiffObject(liffModule);
        setIsMockMode(false);

        if (liffModule.isLoggedIn()) {
          const lProfile = await liffModule.getProfile();
          if (cancelled) return;

          setLineProfile({
            userId: lProfile.userId,
            displayName: lProfile.displayName,
            pictureUrl: lProfile.pictureUrl,
          });

          // If user already has a saved session (e.g. registered earlier without real LINE userId),
          // bind their real LINE userId and switch Rich Menu immediately.
          if (savedProfile) {
            const isApproved = savedProfile.role !== 'PENDING' && savedProfile.approval_status !== 'PENDING';
            if (!REAL_LINE_USER_ID_RE.test(savedProfile.line_user_id)) {
              const updatedProfile: UserProfile = {
                ...savedProfile,
                line_user_id: lProfile.userId,
              };
              setProfile(updatedProfile);
              if (typeof window !== 'undefined') {
                localStorage.setItem('yfti_auth_session', JSON.stringify(updatedProfile));
              }
            }
            if (isApproved) {
              syncLineRichMenu(lProfile.userId, 'link');
            }
          } else {
            // Otherwise check if this LINE user already exists in Supabase
            const dbProfile = await syncProfileFromSupabase(lProfile.userId);
            if (!cancelled && dbProfile) {
              setProfile(dbProfile);
              setIsRegistered(true);
              if (typeof window !== 'undefined') {
                localStorage.setItem('yfti_auth_session', JSON.stringify(dbProfile));
              }
              if (dbProfile.role !== 'PENDING' && dbProfile.approval_status !== 'PENDING') {
                syncLineRichMenu(lProfile.userId, 'link');
              }
            }
          }
        }
      } catch (err) {
        console.warn('LIFF init warning:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'LIFF initialization error');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, [syncLineRichMenu, syncProfileFromSupabase]);

  const loginWithCredentials = (user: string, pass: string): boolean => {
    const trimmedUser = user.trim();
    const trimmedPass = pass.trim();

    if (
      (trimmedUser.toLowerCase() === 'yfti11' && trimmedPass === 'yfti@11') ||
      (trimmedUser === 'YFTI Admin' && trimmedPass === '(XM8zvGei1l$XaHc&nT$oqs&')
    ) {
      const authUser: UserProfile = {
        ...mockCurrentUser,
        line_user_id: lineProfile?.userId || mockCurrentUser.line_user_id,
        display_name: trimmedUser === 'YFTI Admin' ? 'YFTI Admin' : 'พงศ์พิชาญ ธนสิริพูนสิน (Golf)',
        role: trimmedUser === 'YFTI Admin' ? 'SUPER_ADMIN' : 'MEMBER',
      };
      setProfile(authUser);
      setIsRegistered(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_auth_session', JSON.stringify(authUser));
      }
      syncLineRichMenu(authUser.line_user_id, 'link');
      return true;
    }
    return false;
  };

  const switchProfile = (user: UserProfile) => {
    const resolvedUser: UserProfile =
      !REAL_LINE_USER_ID_RE.test(user.line_user_id) && lineProfile?.userId
        ? { ...user, line_user_id: lineProfile.userId }
        : user;
    setProfile(resolvedUser);
    setIsRegistered(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yfti_auth_session', JSON.stringify(resolvedUser));
    }
    if (resolvedUser.role !== 'PENDING' && resolvedUser.approval_status !== 'PENDING') {
      syncLineRichMenu(resolvedUser.line_user_id, 'link');
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
    const activeLineUserId = profile?.line_user_id || lineProfile?.userId;
    syncLineRichMenu(activeLineUserId, 'unlink');
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

  const refetchProfile = async () => {
    if (lineProfile?.userId) {
      const dbProfile = await syncProfileFromSupabase(lineProfile.userId);
      if (dbProfile) {
        switchProfile(dbProfile);
      }
    }
  };

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
