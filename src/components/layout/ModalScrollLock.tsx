'use client';

import { useEffect } from 'react';

const MODAL_SELECTOR = '[aria-modal="true"], .fixed.inset-0.z-50';

function findScrollableAncestor(target: EventTarget | null, boundary: Element): HTMLElement | null {
  let el = target instanceof HTMLElement ? target : null;
  while (el && el !== boundary && el !== document.body) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
    if (isScrollable) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export const ModalScrollLock: React.FC = () => {
  useEffect(() => {
    let isLocked = false;
    let rafId: number | null = null;

    const prevStyles = {
      htmlOverflow: '',
      htmlOverscroll: '',
      bodyOverflow: '',
      bodyPaddingRight: '',
      bodyOverscroll: '',
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isLocked) return;
      const modal = document.querySelector(MODAL_SELECTOR);
      if (!modal) return;

      const scrollable = findScrollableAncestor(e.target, modal);
      if (!scrollable) {
        e.preventDefault();
      }
    };

    const lockScroll = () => {
      if (isLocked) return;
      isLocked = true;

      const html = document.documentElement;
      const body = document.body;
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      prevStyles.htmlOverflow = html.style.overflow;
      prevStyles.htmlOverscroll = html.style.overscrollBehavior;
      prevStyles.bodyOverflow = body.style.overflow;
      prevStyles.bodyPaddingRight = body.style.paddingRight;
      prevStyles.bodyOverscroll = body.style.overscrollBehavior;

      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.overflow = 'hidden';
      body.style.overscrollBehavior = 'none';
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    };

    const unlockScroll = () => {
      if (!isLocked) return;
      isLocked = false;

      document.removeEventListener('touchmove', handleTouchMove);

      const html = document.documentElement;
      const body = document.body;

      html.style.overflow = prevStyles.htmlOverflow;
      html.style.overscrollBehavior = prevStyles.htmlOverscroll;
      body.style.overflow = prevStyles.bodyOverflow;
      body.style.overscrollBehavior = prevStyles.bodyOverscroll;
      body.style.paddingRight = prevStyles.bodyPaddingRight;
    };

    const syncLockState = () => {
      const hasOpenModal = document.querySelector(MODAL_SELECTOR) !== null;
      if (hasOpenModal) {
        lockScroll();
      } else {
        unlockScroll();
      }
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncLockState();
      });
    };

    syncLockState();

    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-modal'],
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      unlockScroll();
    };
  }, []);

  return null;
};
