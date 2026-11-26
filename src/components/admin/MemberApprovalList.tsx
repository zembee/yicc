'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Clock,
} from 'lucide-react';

type FilterMode = 'PENDING' | 'APPROVED' | 'ALL';

interface MemberApplication extends UserProfile {
  created_at?: string;
}

export const MemberApprovalList: React.FC = () => {
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [filter, setFilter] = useState<FilterMode>('PENDING');
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [supabaseReachable, setSupabaseReachable] = useState<boolean | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const mergedMap = new Map<string, MemberApplication>();

      // 1. Load from server API (shared across all browsers/devices)
      try {
        const res = await fetch('/api/members/applications', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as {
            applications?: MemberApplication[];
            supabaseReachable?: boolean;
          };
          if (typeof json.supabaseReachable === 'boolean') {
            setSupabaseReachable(json.supabaseReachable);
          }
          if (Array.isArray(json.applications)) {
            json.applications.forEach((item) => {
              if (item.line_user_id) {
                mergedMap.set(item.line_user_id, item);
              }
            });
          }
        }
      } catch {}

      // 2. Load local applications (fallback / offline mode)
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('yfti_member_applications');
          const parsed = raw ? (JSON.parse(raw) as MemberApplication[]) : [];
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item.line_user_id && !mergedMap.has(item.line_user_id)) {
                mergedMap.set(item.line_user_id, item);
              }
            });
          }
        } catch {}
      }

      // 3. Load from Supabase profiles (if reachable)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50);

        if (!error && Array.isArray(data)) {
          data
            .filter((row) => row?.line_user_id !== 'U_TEST_DEBUG_999')
            .forEach((row) => {
            const existing = mergedMap.get(row.line_user_id);
            const isPendingBatch =
              typeof row.cohort_batch === 'string' && row.cohort_batch.includes('PENDING');
            const isRejectedBatch =
              typeof row.cohort_batch === 'string' && row.cohort_batch.includes('REJECTED');
            const isRowPending = row.role === 'PENDING' || isPendingBatch;

            const app: MemberApplication = {
              ...(existing || {}),
              ...(row as UserProfile),
              role: isRowPending ? 'PENDING' : (row.role as UserProfile['role']),
              approval_status: isRejectedBatch
                ? 'REJECTED'
                : isRowPending
                ? 'PENDING'
                : existing?.approval_status === 'REJECTED'
                ? 'REJECTED'
                : 'APPROVED',
            };
            if (isRowPending || isRejectedBatch || existing) {
              mergedMap.set(row.line_user_id, app);
            }
          });
        }
      } catch {}

      setApplications(Array.from(mergedMap.values()));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const updateLocalStorageApplication = (
    lineUserId: string,
    updates: Partial<MemberApplication>
  ) => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('yfti_member_applications');
      const list = raw ? (JSON.parse(raw) as MemberApplication[]) : [];
      if (Array.isArray(list)) {
        const next = list.map((item) =>
          item.line_user_id === lineUserId ? { ...item, ...updates } : item
        );
        localStorage.setItem('yfti_member_applications', JSON.stringify(next));
      }

      const authRaw = localStorage.getItem('yfti_auth_session');
      if (authRaw) {
        const authParsed = JSON.parse(authRaw) as UserProfile;
        if (authParsed.line_user_id === lineUserId) {
          localStorage.setItem(
            'yfti_auth_session',
            JSON.stringify({ ...authParsed, ...updates })
          );
        }
      }
    } catch {}
  };

  const handleDecision = async (
    app: MemberApplication,
    decision: 'APPROVED' | 'REJECTED'
  ) => {
    setProcessingId(app.line_user_id);
    try {
      const nextRole: UserProfile['role'] = decision === 'APPROVED' ? 'MEMBER' : 'PENDING';
      const updates: Partial<MemberApplication> = {
        role: nextRole,
        approval_status: decision,
        points_balance: decision === 'APPROVED' ? Math.max(app.points_balance || 0, 100) : 0,
        xp_balance: decision === 'APPROVED' ? Math.max(app.xp_balance || 0, 300) : 0,
      };

      // 1. Update server API store + LINE Rich Menu
      try {
        await fetch('/api/members/applications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: app.line_user_id,
            decision,
          }),
        });
      } catch {}

      // 2. Update Supabase if configured
      try {
        await supabase
          .from('profiles')
          .update({
            role: 'MEMBER',
            cohort_batch: decision === 'APPROVED' ? 'YFTI 11' : 'YFTI 11 (REJECTED)',
            points_balance: updates.points_balance,
            xp_balance: updates.xp_balance,
            updated_at: new Date().toISOString(),
          })
          .eq('line_user_id', app.line_user_id);
      } catch {}

      // 2. Update localStorage
      updateLocalStorageApplication(app.line_user_id, updates);

      // 3. Switch LINE Rich Menu for the user immediately
      fetch('/api/line/richmenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: app.line_user_id,
          action: decision === 'APPROVED' ? 'link' : 'unlink',
        }),
      }).catch(() => {});

      setApplications((prev) =>
        prev.map((item) =>
          item.line_user_id === app.line_user_id ? { ...item, ...updates } : item
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = applications.filter(
    (a) => a.role === 'PENDING' && a.approval_status !== 'REJECTED'
  ).length;

  const filteredApps = applications.filter((a) => {
    if (filter === 'PENDING') {
      return a.role === 'PENDING' && a.approval_status !== 'REJECTED';
    }
    if (filter === 'APPROVED') {
      return a.role !== 'PENDING' && a.approval_status !== 'REJECTED';
    }
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-[#1E2538] flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#B38728]" />
          <span>อนุมัติสมาชิกใหม่ (Member Approval)</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            รออนุมัติ {pendingCount} คน
          </span>
          <button
            type="button"
            onClick={loadApplications}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#1E2538] hover:bg-slate-50 transition"
            title="รีเฟรชรายการ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(
            [
              { key: 'PENDING', label: `รออนุมัติ (${pendingCount})` },
              { key: 'APPROVED', label: 'อนุมัติแล้ว' },
              { key: 'ALL', label: 'ทั้งหมด' },
            ] as { key: FilterMode; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                filter === tab.key
                  ? 'bg-[#1E2538] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {supabaseReachable === false && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            Local Fallback Mode (เชื่อมต่อ Supabase ไม่ได้)
          </span>
        )}
      </div>

      {filteredApps.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ไม่มีรายการคำขอสมัครสมาชิกในหมวดนี้
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredApps.map((app) => {
            const isPending = app.role === 'PENDING' && app.approval_status !== 'REJECTED';
            const isRejected = app.approval_status === 'REJECTED';
            const isBusy = processingId === app.line_user_id;

            return (
              <div
                key={app.line_user_id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        app.picture_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          app.display_name
                        )}`
                      }
                      alt={app.display_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#1E2538] truncate">
                        {app.display_name}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>{app.company_name || '-'}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isRejected
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isPending ? 'รออนุมัติ' : isRejected ? 'ปฏิเสธแล้ว' : 'อนุมัติแล้ว'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono font-semibold">{app.phone_number || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{app.position || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{app.email || '-'}</span>
                  </div>
                </div>

                {isPending ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDecision(app, 'APPROVED')}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isBusy ? 'กำลังดำเนินการ...' : 'อนุมัติสมาชิก'}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDecision(app, 'REJECTED')}
                      className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      ปฏิเสธ
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {isRejected
                        ? 'ปฏิเสธคำขอแล้ว'
                        : 'อนุมัติและปลดล็อกสิทธิ์สมาชิกแล้ว'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
