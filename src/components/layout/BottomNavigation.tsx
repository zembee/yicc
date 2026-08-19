'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  CalendarDays, 
  Users, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { useLiffAuth } from '@/contexts/LiffContext';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useLiffAuth();

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  const navItems = [
    { label: 'Academy', href: '/academy', icon: GraduationCap },
    { label: 'Events', href: '/events', icon: CalendarDays },
    { label: 'Directory', href: '/directory', icon: Users },
    { label: 'Profile', href: '/profile', icon: User },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#EEEEEE] pb-safe shadow-[0_-4px_20px_rgba(33,37,66,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/academy' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#212542] font-bold scale-105'
                  : 'text-[#6B7280] hover:text-[#212542] font-medium'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition ${isActive ? 'bg-[#DBDFFF]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#212542]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FB7170] rounded-full" />
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'text-[#212542] font-bold' : 'text-[#6B7280]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
