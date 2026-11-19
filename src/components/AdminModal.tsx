'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(panel: HTMLElement) {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    element => element.getClientRects().length > 0 && !element.hasAttribute('inert')
  );
}

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-3xl',
  placement = 'center',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  placement?: 'center' | 'right';
}) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const downOnBackdrop = useRef(false);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const reducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!mounted || !open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight);
      document.body.style.paddingRight = `${(Number.isFinite(currentPadding) ? currentPadding : 0) + scrollbarWidth}px`;
    }

    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const firstFocusable = panel ? getFocusableElements(panel)[0] : undefined;
    (firstFocusable ?? panel)?.focus({ preventScroll: true });

    const parent = overlay?.parentElement;
    const changedInert: Array<[Element, string | null]> = [];
    if (parent && overlay) {
      for (const child of Array.from(parent.children)) {
        if (child === overlay) continue;
        changedInert.push([child, child.getAttribute('inert')]);
        child.setAttribute('inert', '');
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const elements = getFocusableElements(panel);
      if (elements.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (panel && !panel.contains(event.target as Node)) {
        panel.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      for (const [element, previous] of changedInert) {
        if (previous === null) element.removeAttribute('inert');
        else element.setAttribute('inert', previous);
      }
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [mounted, open]);

  if (!mounted) return null;

  const isRightDrawer = placement === 'right';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-modal"
          ref={overlayRef}
          className={`fixed inset-0 z-[100] overflow-y-auto ${
            isRightDrawer ? 'flex justify-end' : 'grid place-items-center p-4 sm:p-6'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
          onPointerDown={event => {
            downOnBackdrop.current = !panelRef.current?.contains(event.target as Node);
          }}
          onClick={event => {
            if (downOnBackdrop.current && !panelRef.current?.contains(event.target as Node)) {
              onCloseRef.current();
            }
            downOnBackdrop.current = false;
          }}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`admin-panel-content relative w-full ${maxWidth} outline-none ${
              isRightDrawer ? 'min-h-full' : ''
            }`}
            initial={isRightDrawer
              ? { opacity: 0, x: reducedMotion ? 0 : 36 }
              : { opacity: 0, scale: reducedMotion ? 1 : 0.97, y: reducedMotion ? 0 : 10 }}
            animate={isRightDrawer ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isRightDrawer
              ? { opacity: 0, x: reducedMotion ? 0 : 36 }
              : { opacity: 0, scale: reducedMotion ? 1 : 0.98, y: reducedMotion ? 0 : 6 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
            onClick={event => event.stopPropagation()}
          >
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
