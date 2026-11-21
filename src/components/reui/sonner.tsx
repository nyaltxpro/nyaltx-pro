'use client';

import { AnimatePresence, motion } from 'motion/react';
import { FiAlertCircle, FiCheckSquare, FiLoader, FiX } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { resolveValue, toast as hotToast, ToastBar, Toaster, type Toast } from 'react-hot-toast';

export function ToasterProvider() {
  const pathname = usePathname();
  const isAdminPanel = pathname?.startsWith('/adminpanel') ?? false;

  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={isAdminPanel ? { top: 16, right: 16, zIndex: 200 } : undefined}
      toastOptions={{
        duration: 4000,
        style: {
          border: '1px solid rgb(255 255 255 / 10%)',
          borderRadius: '0.75rem',
          background: '#111821',
          color: '#e2e8f0',
          boxShadow: '0 12px 32px rgb(0 0 0 / 35%)',
          fontFamily: 'var(--font-sans, sans-serif)',
        },
        success: {
          style: {
            border: '1px solid rgb(52 211 153 / 25%)',
            background: '#102019',
            color: '#d1fae5',
          },
        },
        error: {
          style: {
            border: '1px solid rgb(248 113 113 / 25%)',
            background: '#241315',
            color: '#fee2e2',
          },
        },
      }}
    >
      {(notification: Toast) =>
        isAdminPanel ? (
          <AnimatePresence initial={false}>
            {notification.visible && (
              <motion.div
                layout
                initial={{ y: -15, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role={notification.ariaProps.role}
                aria-live={notification.ariaProps['aria-live']}
                className={`pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-2.5 rounded-xl border p-3 text-sm font-medium text-white shadow-xl backdrop-blur-xl ${
                  notification.type === 'error'
                    ? 'border-red-400/25 bg-[#25151b]/95'
                    : notification.type === 'loading'
                      ? 'border-cyan-300/25 bg-[#101c2a]/95'
                      : 'border-cyan-300/25 bg-gradient-to-br from-[#102638]/95 to-[#111827]/95'
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 ${
                    notification.type === 'error'
                      ? 'text-red-300'
                      : notification.type === 'loading'
                        ? 'animate-spin text-cyan-300'
                        : 'text-cyan-300'
                  }`}
                  aria-hidden="true"
                >
                  {notification.type === 'error' ? (
                    <FiAlertCircle />
                  ) : notification.type === 'loading' ? (
                    <FiLoader />
                  ) : (
                    <FiCheckSquare />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-slate-100">
                  {resolveValue(notification.message, notification)}
                </span>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => hotToast.dismiss(notification.id)}
                  className="shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <FiX aria-hidden="true" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <ToastBar toast={notification} />
        )
      }
    </Toaster>
  );
}
