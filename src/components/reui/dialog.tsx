'use client';

import type { ComponentProps } from 'react';
import AdminModal from '@/components/AdminModal';

type DialogProps = Omit<ComponentProps<typeof AdminModal>, 'placement'>;

export function Dialog(props: DialogProps) {
  return <AdminModal {...props} placement="center" />;
}
