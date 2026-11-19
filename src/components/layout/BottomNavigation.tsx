'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Gift,
  CalendarDays, 
  Users, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { useLiffAuth } from '@/contexts/LiffContext';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useLiffAuth();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  if (pathname === '/register') {
    return null;
  }

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  const navItems = [
    { label: 'หน้าแรก', href: '/', icon: Home },
    { label: 'สิทธิพิเศษ', href: '/privileges', icon: Gift },
    { label: 'ธุรกิจ', href: '/directory', icon: Users },
    { label: 'กิจกรรม', href: '/events', icon: CalendarDays },
    { label: 'โปรไฟล์', href: '/profile', icon: User },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const activePath = pendingHref ?? pathname;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePath === item.href ||
            (item.href !== '/' && activePath.startsWith(item.href)) ||
            (item.href === '/directory' && activePath.startsWith('/yfti_participants'));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (pathname !== item.href) {
                  setPendingHref(item.href);
                }
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 px-1 transition-all duration-200 ease-out active:scale-95 ${
                isActive
                  ? 'text-[#1E2538]'
                  : 'text-slate-400 hover:text-[#1E2538]'
              }`}
            >
              {/* Top Coral Active Indicator */}
              <span
                aria-hidden="true"
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full bg-[#FB7170] transition-all duration-200 ${
                  isActive ? 'w-7 opacity-100' : 'w-0 opacity-0'
                }`}
              />

              <Icon
                className={`w-[19px] h-[19px] transition-colors duration-200 ${
                  isActive ? 'text-[#1E2538] stroke-[2.3]' : 'text-slate-400 stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none transition-colors duration-200 ${
                  isActive ? 'text-[#1E2538] font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
