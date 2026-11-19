'use client';

import type { ComponentProps } from 'react';
import AdminModal from '@/components/AdminModal';

type DrawerProps = Omit<ComponentProps<typeof AdminModal>, 'placement'>;

export function Drawer(props: DrawerProps) {
  return <AdminModal {...props} placement="right" />;
}
