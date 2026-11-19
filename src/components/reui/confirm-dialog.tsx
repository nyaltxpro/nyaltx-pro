'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/reui/button';
import { Dialog } from '@/components/reui/dialog';

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function useConfirmDialog() {
  const [request, setRequest] = useState<ConfirmDialogOptions | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const resolveRequest = useCallback((confirmed: boolean) => {
    const resolve = resolver.current;
    resolver.current = null;
    setRequest(null);
    resolve?.(confirmed);
  }, []);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    if (resolver.current) resolveRequest(false);
    return new Promise<boolean>(resolve => {
      resolver.current = resolve;
      setRequest(options);
    });
  }, [resolveRequest]);

  const dialog = (
    <Dialog
      open={request !== null}
      onClose={() => resolveRequest(false)}
      title={request?.title ?? 'Confirm action'}
      maxWidth="max-w-md"
    >
      {request && (
        <div className="space-y-5 rounded-xl border border-white/10 bg-[#0d0d0d] p-5 text-white shadow-2xl">
          <h3 className="text-lg font-semibold">{request.title}</h3>
          <p className="text-sm leading-6 text-slate-300">{request.description}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => resolveRequest(false)}>
              Cancel
            </Button>
            <Button
              variant={request.destructive ? 'destructive' : 'default'}
              onClick={() => resolveRequest(true)}
            >
              {request.confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );

  return { confirm, dialog };
}
