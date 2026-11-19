'use client';

import { useEffect } from 'react';

const MODAL_SELECTOR = '[aria-modal="true"], .fixed.inset-0.z-50';

export const ModalScrollLock: React.FC = () => {
  useEffect(() => {
    let isLocked = false;
    let savedScrollY = 0;
    let rafId: number | null = null;

    const prevStyles = {
      htmlOverflow: '',
      htmlOverscroll: '',
      bodyOverflow: '',
      bodyPosition: '',
      bodyTop: '',
      bodyLeft: '',
      bodyRight: '',
      bodyWidth: '',
      bodyPaddingRight: '',
      bodyOverscroll: '',
    };

    const lockScroll = () => {
      if (isLocked) return;
      isLocked = true;
      savedScrollY = window.scrollY || window.pageYOffset || 0;

      const html = document.documentElement;
      const body = document.body;
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      prevStyles.htmlOverflow = html.style.overflow;
      prevStyles.htmlOverscroll = html.style.overscrollBehavior;
      prevStyles.bodyOverflow = body.style.overflow;
      prevStyles.bodyPosition = body.style.position;
      prevStyles.bodyTop = body.style.top;
      prevStyles.bodyLeft = body.style.left;
      prevStyles.bodyRight = body.style.right;
      prevStyles.bodyWidth = body.style.width;
      prevStyles.bodyPaddingRight = body.style.paddingRight;
      prevStyles.bodyOverscroll = body.style.overscrollBehavior;

      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.overflow = 'hidden';
      body.style.overscrollBehavior = 'none';
      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    };

    const unlockScroll = () => {
      if (!isLocked) return;
      isLocked = false;

      const html = document.documentElement;
      const body = document.body;

      html.style.overflow = prevStyles.htmlOverflow;
      html.style.overscrollBehavior = prevStyles.htmlOverscroll;
      body.style.overflow = prevStyles.bodyOverflow;
      body.style.overscrollBehavior = prevStyles.bodyOverscroll;
      body.style.position = prevStyles.bodyPosition;
      body.style.top = prevStyles.bodyTop;
      body.style.left = prevStyles.bodyLeft;
      body.style.right = prevStyles.bodyRight;
      body.style.width = prevStyles.bodyWidth;
      body.style.paddingRight = prevStyles.bodyPaddingRight;

      window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' as ScrollBehavior });
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
