'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function RouteProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const clearTimers = () => {
    if (trickleTimerRef.current !== null) {
      window.clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  const finishProgress = () => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;
    clearTimers();
    setProgress(100);
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
  };

  const startProgress = () => {
    clearTimers();
    isNavigatingRef.current = true;
    setVisible(true);
    setProgress(22);

    trickleTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const step = prev < 50 ? 12 : prev < 75 ? 6 : 2;
        return Math.min(88, prev + step);
      });
    }, 180);

    // Safety fallback in case navigation is cancelled or intercepted
    safetyTimerRef.current = window.setTimeout(() => {
      finishProgress();
    }, 8000);
  };

  // Finish progress whenever route or search params change
  useEffect(() => {
    finishProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Listen to internal anchor clicks for instant visual feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;

        const currentUrl = new URL(window.location.href);
        if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
          return;
        }

        startProgress();
      } catch {
        // Ignore invalid URLs
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-[#B18A3B] via-[#ECD28E] to-[#DFC27D] shadow-[0_0_12px_rgba(223,194,125,0.75)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export const RouteProgressBar: React.FC = () => {
  return (
    <React.Suspense fallback={null}>
      <RouteProgressBarInner />
    </React.Suspense>
  );
};
