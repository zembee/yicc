'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Gift,
  QrCode,
  Users,
  User,
} from 'lucide-react';
import { QuickQrHubSheet } from './QuickQrHubSheet';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LEFT_ITEMS: NavItem[] = [
  { label: 'หน้าแรก', href: '/', icon: Home },
  { label: 'สิทธิพิเศษ', href: '/privileges', icon: Gift },
];

const RIGHT_ITEMS: NavItem[] = [
  { label: 'เครือข่ายธุรกิจ', href: '/directory', icon: Users },
  { label: 'โปรไฟล์', href: '/profile', icon: User },
];

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  if (pathname === '/register') {
    return null;
  }

  const activePath = pendingHref ?? pathname;

  const isRouteActive = (href: string) =>
    activePath === href ||
    (href !== '/' && activePath.startsWith(href)) ||
    (href === '/directory' && activePath.startsWith('/yfti_participants'));

  const renderTab = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = isRouteActive(item.href);

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
          isActive ? 'text-[#1E2538]' : 'text-slate-400 hover:text-[#1E2538]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full bg-[#C59B38] transition-all duration-200 ${
            isActive ? 'w-7 opacity-100' : 'w-0 opacity-0'
          }`}
        />
        <Icon
          className={`w-[20px] h-[20px] transition-colors duration-200 ${
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
  };

  return (
    <>
      <nav
        aria-label="เมนูหลัก"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFCF9]/95 backdrop-blur-md border-t border-[#E6E0D4] pb-safe shadow-[0_-8px_28px_rgba(11,16,29,0.09)]"
      >
        <div className="max-w-md mx-auto flex items-end justify-between px-1.5">
          {LEFT_ITEMS.map(renderTab)}

          {/* Center Floating Satin Champagne-Gold QR Button */}
          <div className="relative flex-1 flex flex-col items-center justify-end pb-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQrSheetOpen((prev) => !prev);
              }}
              aria-label="เปิด Quick QR และ Hub"
              aria-expanded={isQrSheetOpen}
              className="flex flex-col items-center group -mt-6 active:scale-95 transition-transform"
            >
              <span
                className={`w-[56px] h-[56px] rounded-full flex items-center justify-center border-[3.5px] border-[#FDFCF9] transition-all duration-200 luxury-gold-btn ${
                  isQrSheetOpen
                    ? 'ring-2 ring-[#0D1321] scale-105'
                    : 'ring-1 ring-[#C5A059]/35'
                }`}
              >
                <QrCode className="w-6 h-6 stroke-[2.1]" />
              </span>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none font-bold transition-colors ${
                  isQrSheetOpen ? 'text-[#1E2538]' : 'text-[#9A742B]'
                }`}
              >
                QR และคูปอง
              </span>
            </button>
          </div>

          {RIGHT_ITEMS.map(renderTab)}
        </div>
      </nav>

      <QuickQrHubSheet
        isOpen={isQrSheetOpen}
        onClose={() => setIsQrSheetOpen(false)}
      />
    </>
  );
};
