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
  isRegistered: true,
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
  const [profile, setProfile] = useState<UserProfile | null>(mockCurrentUser);
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  const syncSupabaseProfile = useCallback(async (lineUser: { userId: string; displayName: string; pictureUrl?: string }, shouldRedirect = false) => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*, house:houses(*)')
        .eq('line_user_id', lineUser.userId)
        .maybeSingle();

      if (fetchErr) {
        console.error('Error fetching profile from Supabase:', fetchErr);
      }

      if (!data) {
        setIsRegistered(false);
        setProfile({
          id: '',
          line_user_id: lineUser.userId,
          display_name: lineUser.displayName,
          picture_url: lineUser.pictureUrl,
          cohort_batch: 'YFTI 11',
          role: 'MEMBER',
          points_balance: 0,
          xp_balance: 0,
          attendance_rate: 100,
        });

        if (shouldRedirect && typeof window !== 'undefined' && window.location.pathname !== '/register') {
          router.replace('/register');
        }
      } else {
        const hasCompletedInfo = Boolean(data.company_name && data.phone_number);
        setIsRegistered(hasCompletedInfo);
        setProfile({ ...data, attendance_rate: data.attendance_rate ?? 100 });

        if (shouldRedirect && !hasCompletedInfo && typeof window !== 'undefined' && window.location.pathname !== '/register') {
          router.replace('/register');
        }
      }
    } catch (err: any) {
      console.warn('Supabase sync error (fallback to local state):', err);
      setIsRegistered(true);
      setProfile((prev) => prev || {
        ...mockCurrentUser,
        line_user_id: lineUser.userId,
        display_name: lineUser.displayName,
        picture_url: lineUser.pictureUrl || mockCurrentUser.picture_url,
      });
    }
  }, [router]);

  const initLiff = useCallback(async () => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('yfti_user_profile');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.display_name) {
            setProfile(parsed);
          }
        } catch(e){}
      }
    }

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    
    if (!liffId || liffId === 'mock-liff-id' || liffId === 'your-line-liff-id-here') {
      setIsMockMode(true);
      return;
    }

    try {
      const liffModule = (await import('@line/liff')).default;
      await liffModule.init({ liffId });
      setLiffObject(liffModule);

      if (liffModule.isLoggedIn()) {
        setIsMockMode(false);
        const lProfile = await liffModule.getProfile();
        setLineProfile({
          userId: lProfile.userId,
          displayName: lProfile.displayName,
          pictureUrl: lProfile.pictureUrl,
        });
        await syncSupabaseProfile(lProfile, false);
      } else if (liffModule.isInClient()) {
        // If strictly inside LINE App webview, trigger LINE login
        liffModule.login();
      }
    } catch (err: any) {
      console.warn('LIFF init info (Running Web Browsing Mode):', err);
      setIsMockMode(true);
    }
  }, [syncSupabaseProfile]);

  useEffect(() => {
    initLiff();
  }, [initLiff]);

  const refetchProfile = async () => {
    if (lineProfile && !isMockMode) {
      await syncSupabaseProfile(lineProfile, false);
    }
  };

  const updateRole = (newRole: UserProfile['role']) => {
    if (profile) {
      const updated = { ...profile, role: newRole };
      setProfile(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_user_profile', JSON.stringify(updated));
      }
    }
  };

  const switchProfile = (user: UserProfile) => {
    setProfile(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yfti_user_profile', JSON.stringify(user));
    }
  };

  const loginWithCredentials = (user: string, pass: string): boolean => {
    if ((user === 'yfti11' && pass === 'yfti@11') || (user === 'YFTI Admin' && pass === '(XM8zvGei1l$XaHc&nT$oqs&')) {
      const authUser: UserProfile = {
        ...mockCurrentUser,
        display_name: user === 'YFTI Admin' ? 'YFTI Admin' : 'yfti11 (Admin / Member)',
        role: 'SUPER_ADMIN'
      };
      setProfile(authUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_user_profile', JSON.stringify(authUser));
      }
      return true;
    }
    return false;
  };

  const loginWithLine = () => {
    if (liffObject) {
      liffObject.login();
    } else {
      alert('LINE LIFF บริการยังไม่ได้เชื่อมต่อในโหมดเว็บ');
    }
  };

  const logout = () => {
    if (liffObject?.isLoggedIn()) {
      liffObject.logout();
    }
    setProfile(mockCurrentUser);
    setLineProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yfti_user_profile');
    }
  };

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        profile,
        lineProfile,
        isLoggedIn: !!profile,
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
