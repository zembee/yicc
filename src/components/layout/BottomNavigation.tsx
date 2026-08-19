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

  if (pathname === '/register') {
    return null;
  }

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  const navItems = [
    { label: 'Academy', href: '/academy', icon: GraduationCap },
    { label: 'Events', href: '/events', icon: CalendarDays },
    { label: 'Directory', href: '/directory', icon: Users },
    { label: 'Profile', href: '/profile', icon: User },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/academy' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#181B34] font-bold'
                  : 'text-slate-500 hover:text-[#181B34] font-medium'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-[#181B34] text-white shadow-sm' : 'text-slate-500'
              }`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight font-medium ${
                isActive ? 'text-[#181B34] font-bold' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#FB7170] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

