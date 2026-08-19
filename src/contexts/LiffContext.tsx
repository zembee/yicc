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
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
  refetchProfile: () => Promise<void>;
  updateRole: (newRole: UserProfile['role']) => void;
  logout: () => void;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  profile: null,
  lineProfile: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,
  isMockMode: true,
  refetchProfile: async () => {},
  updateRole: () => {},
  logout: () => {},
});

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [lineProfile, setLineProfile] = useState<{ userId: string; displayName: string; pictureUrl?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  const syncSupabaseProfile = useCallback(async (lineUser: { userId: string; displayName: string; pictureUrl?: string }) => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*, house:houses(*), profile_attendance_stats(attendance_percentage)')
        .eq('line_user_id', lineUser.userId)
        .single();

      if (fetchErr && fetchErr.code === 'PGRST116') {
        const { data: newUser, error: createErr } = await supabase
          .from('profiles')
          .insert({
            line_user_id: lineUser.userId,
            display_name: lineUser.displayName,
            picture_url: lineUser.pictureUrl,
            role: 'MEMBER',
          })
          .select('*, house:houses(*)')
          .single();

        if (createErr) throw createErr;
        setProfile({ ...newUser, attendance_rate: 100 });
      } else if (data) {
        if (data.display_name !== lineUser.displayName || data.picture_url !== lineUser.pictureUrl) {
          await supabase
            .from('profiles')
            .update({ display_name: lineUser.displayName, picture_url: lineUser.pictureUrl })
            .eq('id', data.id);
        }

        const attendance = Array.isArray(data.profile_attendance_stats) 
          ? data.profile_attendance_stats[0]?.attendance_percentage ?? 100
          : 100;

        setProfile({ ...data, attendance_rate: attendance });
      }
    } catch (err: any) {
      console.warn('Supabase sync error (fallback to local state):', err);
      // Fallback
      setProfile((prev) => prev || {
        ...mockCurrentUser,
        line_user_id: lineUser.userId,
        display_name: lineUser.displayName,
        picture_url: lineUser.pictureUrl || mockCurrentUser.picture_url,
      });
    }
  }, []);

  const initLiff = useCallback(async () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    
    // ถ้าไม่มี LIFF ID จริงหรือเป็น mock ID ให้ใช้ Mock Mode
    if (!liffId || liffId === 'mock-liff-id' || liffId === 'your-line-liff-id-here') {
      setIsMockMode(true);
      setProfile(mockCurrentUser);
      setLineProfile({
        userId: mockCurrentUser.line_user_id,
        displayName: mockCurrentUser.display_name,
        pictureUrl: mockCurrentUser.picture_url,
      });
      setIsLoading(false);
      return;
    }

    try {
      const liffModule = (await import('@line/liff')).default;
      await liffModule.init({ liffId });
      setLiffObject(liffModule);
      setIsMockMode(false);

      if (!liffModule.isLoggedIn()) {
        if (!liffModule.isInClient()) {
          liffModule.login();
          return;
        }
      }

      const lProfile = await liffModule.getProfile();
      setLineProfile({
        userId: lProfile.userId,
        displayName: lProfile.displayName,
        pictureUrl: lProfile.pictureUrl,
      });

      await syncSupabaseProfile(lProfile);
    } catch (err: any) {
      console.warn('LIFF init warning (Running in Local Demo Mode):', err);
      setIsMockMode(true);
      setProfile(mockCurrentUser);
      setLineProfile({
        userId: mockCurrentUser.line_user_id,
        displayName: mockCurrentUser.display_name,
        pictureUrl: mockCurrentUser.picture_url,
      });
    } finally {
      setIsLoading(false);
    }
  }, [syncSupabaseProfile]);

  useEffect(() => {
    initLiff();
  }, [initLiff]);

  const refetchProfile = async () => {
    if (lineProfile && !isMockMode) {
      await syncSupabaseProfile(lineProfile);
    }
  };

  const updateRole = (newRole: UserProfile['role']) => {
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  const logout = () => {
    if (liffObject?.isLoggedIn()) {
      liffObject.logout();
      setProfile(null);
      setLineProfile(null);
      window.location.reload();
    }
  };

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        profile,
        lineProfile,
        isLoggedIn: !!profile,
        isLoading,
        error,
        isMockMode,
        refetchProfile,
        updateRole,
        logout,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
};

export const useLiffAuth = () => useContext(LiffContext);
