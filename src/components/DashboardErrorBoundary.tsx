'use client';

import Link from 'next/link';
import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error: Error) {
    console.error('Dashboard view crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg text-white">This page failed to load.</p>
          <p className="max-w-md text-sm text-gray-400">{this.state.message}</p>
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#00d4aa] hover:border-[#00d4aa]/40"
          >
            Back to dashboard
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
