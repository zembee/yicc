'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import { mockDirectory } from '@/lib/mockData';
import { useLiffAuth } from '@/contexts/LiffContext';
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
  Trash2,
  Search,
  ShieldCheck,
} from 'lucide-react';

type FilterMode = 'PENDING' | 'APPROVED' | 'ADMINS' | 'ALL';
type AssignableRole = 'MEMBER' | 'HOUSE_ADMIN' | 'SUPER_ADMIN';

interface MemberRoleRecord {
  member_id?: string;
  line_user_id?: string;
  role: AssignableRole;
}

const BUILTIN_SUPER_ADMIN_IDS = ['3296'];

const ROLE_LABELS: Record<AssignableRole, string> = {
  MEMBER: 'สมาชิก',
  HOUSE_ADMIN: 'House Admin',
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_BADGE_CLASS: Record<AssignableRole, string> = {
  MEMBER: 'bg-slate-100 text-slate-600 border-slate-200',
  HOUSE_ADMIN: 'bg-sky-50 text-sky-700 border-sky-200',
  SUPER_ADMIN: 'bg-[#FBF6EC] text-[#8A6516] border-[#EFE2C2]',
};

function findRoleRecord(records: MemberRoleRecord[], app: { id?: string; line_user_id?: string }) {
  return records.find(
    (r) =>
      (app.id && r.member_id && String(r.member_id) === String(app.id)) ||
      (app.line_user_id && r.line_user_id && r.line_user_id === app.line_user_id)
  );
}

interface MemberApplication extends UserProfile {
  created_at?: string;
}

export const MemberApprovalList: React.FC = () => {
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [filter, setFilter] = useState<FilterMode>('PENDING');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingPending, setIsClearingPending] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [supabaseReachable, setSupabaseReachable] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);
  const { profile } = useLiffAuth();
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

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
          .limit(500);

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
            if (row.line_user_id) {
              mergedMap.set(row.line_user_id, app);
            }
          });
        }
      } catch {}

      // 4. Include YFTI 11 directory members (122 ท่าน) as approved members
      const knownIds = new Set(
        Array.from(mergedMap.values())
          .map((a) => (a.id ? String(a.id) : ''))
          .filter(Boolean)
      );
      mockDirectory.forEach((member) => {
        if (mergedMap.has(member.line_user_id) || knownIds.has(String(member.id))) return;
        mergedMap.set(member.line_user_id, {
          ...member,
          // Directory default: everyone is a member unless a Super Admin assigns a role
          role: BUILTIN_SUPER_ADMIN_IDS.includes(String(member.id)) ? 'SUPER_ADMIN' : 'MEMBER',
          approval_status: 'APPROVED',
        });
      });

      // 5. Apply roles assigned by Super Admin
      let roleRecords: MemberRoleRecord[] = [];
      try {
        const res = await fetch('/api/members/roles', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as { roles?: MemberRoleRecord[] };
          if (Array.isArray(json.roles)) roleRecords = json.roles;
        }
      } catch {}

      const merged = Array.from(mergedMap.values()).map((app) => {
        if (app.role === 'PENDING' || app.approval_status === 'REJECTED') return app;
        if (BUILTIN_SUPER_ADMIN_IDS.includes(String(app.id))) return { ...app, role: 'SUPER_ADMIN' as const };
        const record = findRoleRecord(roleRecords, app);
        return record ? { ...app, role: record.role } : app;
      });

      setApplications(merged);
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

  const handleRoleChange = async (app: MemberApplication, nextRole: AssignableRole) => {
    if (!isSuperAdmin || app.role === nextRole) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`ต้องการเปลี่ยนสิทธิ์ของ "${app.display_name}" เป็น ${ROLE_LABELS[nextRole]} หรือไม่?`)
    ) {
      return;
    }

    setRoleError(null);
    setProcessingId(app.line_user_id);
    try {
      const res = await fetch('/api/members/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: app.id,
          // Only send real (non-placeholder) LINE ids so Supabase sync targets the right row
          lineUserId: app.line_user_id?.startsWith('U_YFTI_') ? undefined : app.line_user_id,
          displayName: app.display_name,
          role: nextRole,
          actor: {
            memberId: profile?.id,
            lineUserId: profile?.line_user_id,
            role: profile?.role,
            displayName: profile?.display_name,
          },
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setRoleError(json?.error || 'เปลี่ยนสิทธิ์ไม่สำเร็จ');
        return;
      }
      setApplications((prev) =>
        prev.map((item) =>
          item.line_user_id === app.line_user_id ? { ...item, role: nextRole } : item
        )
      );
    } catch {
      setRoleError('เปลี่ยนสิทธิ์ไม่สำเร็จ');
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearAllPending = async () => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        'ต้องการล้างรายการที่รออนุมัติ (Pending) ทั้งหมดและรีเซ็ตให้ผู้ที่ค้างหน้า Pending สมัครเข้ามาใหม่หรือไม่?'
      )
    ) {
      return;
    }

    setIsClearingPending(true);
    try {
      await fetch('/api/members/applications', { method: 'DELETE' });

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('yfti_member_applications');
          const list = raw ? (JSON.parse(raw) as MemberApplication[]) : [];
          if (Array.isArray(list)) {
            const nonPending = list.filter(
              (item) => item.role !== 'PENDING' && item.approval_status !== 'PENDING'
            );
            localStorage.setItem('yfti_member_applications', JSON.stringify(nonPending));
          }
        } catch {}
      }

      setApplications((prev) =>
        prev.filter((a) => !(a.role === 'PENDING' && a.approval_status !== 'REJECTED'))
      );
    } finally {
      setIsClearingPending(false);
    }
  };

  const pendingCount = applications.filter(
    (a) => a.role === 'PENDING' && a.approval_status !== 'REJECTED'
  ).length;

  const approvedCount = applications.filter(
    (a) => a.role !== 'PENDING' && a.approval_status !== 'REJECTED'
  ).length;

  const adminCount = applications.filter(
    (a) => (a.role === 'SUPER_ADMIN' || a.role === 'HOUSE_ADMIN') && a.approval_status !== 'REJECTED'
  ).length;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredApps = applications.filter((a) => {
    if (normalizedQuery) {
      const haystack = [a.display_name, a.company_name, a.phone_number, a.email, a.position]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }
    if (filter === 'ADMINS') {
      return (a.role === 'SUPER_ADMIN' || a.role === 'HOUSE_ADMIN') && a.approval_status !== 'REJECTED';
    }
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
            onClick={handleClearAllPending}
            disabled={isClearingPending}
            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1 transition"
            title="ล้างรายการรออนุมัติทั้งหมดและรีเซ็ตผู้ที่ค้าง Pending"
          >
            <Trash2 className="w-3 h-3" />
            <span>{isClearingPending ? 'กำลังล้าง...' : 'ล้าง Pending ทั้งหมด'}</span>
          </button>
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
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: 'PENDING', label: `รออนุมัติ (${pendingCount})` },
              { key: 'APPROVED', label: `อนุมัติแล้ว (${approvedCount})` },
              { key: 'ADMINS', label: `แอดมิน (${adminCount})` },
              { key: 'ALL', label: `ทั้งหมด (${applications.length})` },
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

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อ บริษัท เบอร์โทร หรืออีเมล"
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-[#1E2538] placeholder:text-slate-400 focus:outline-none focus:border-[#C59B38] focus:bg-white"
        />
      </div>

      {roleError && (
        <div className="text-[11px] font-bold px-3 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
          {roleError}
        </div>
      )}

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
                ) : isRejected ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>ปฏิเสธคำขอแล้ว</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ROLE_BADGE_CLASS[(app.role as AssignableRole) in ROLE_LABELS ? (app.role as AssignableRole) : 'MEMBER']
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {ROLE_LABELS[(app.role as AssignableRole) in ROLE_LABELS ? (app.role as AssignableRole) : 'MEMBER']}
                    </span>
                    {isSuperAdmin && (
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>แต่งตั้งสิทธิ์</span>
                        <select
                          value={(app.role as AssignableRole) in ROLE_LABELS ? app.role : 'MEMBER'}
                          disabled={isBusy || BUILTIN_SUPER_ADMIN_IDS.includes(String(app.id))}
                          onChange={(e) => handleRoleChange(app, e.target.value as AssignableRole)}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-[#1E2538] disabled:opacity-60 focus:outline-none focus:border-[#C59B38]"
                        >
                          <option value="MEMBER">สมาชิก</option>
                          <option value="HOUSE_ADMIN">House Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </label>
                    )}
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
