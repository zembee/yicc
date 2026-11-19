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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href || (item.href !== '/' && activePath.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (pathname !== item.href) {
                  setPendingHref(item.href);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ease-out active:scale-95 relative ${
                isActive
                  ? 'text-[#1E2538] font-bold'
                  : 'text-slate-500 hover:text-[#1E2538] font-medium'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ease-out ${
                isActive ? 'bg-[#1E2538] text-white shadow-sm scale-105' : 'text-slate-500 scale-100'
              }`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight transition-colors duration-200 ${
                isActive ? 'text-[#1E2538] font-bold' : 'text-slate-500 font-medium'
              }`}>
                {item.label}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full bg-[#C59B38] mt-0.5 transition-all duration-200 ease-out ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
