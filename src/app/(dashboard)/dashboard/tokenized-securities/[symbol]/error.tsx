'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function StockProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Stock profile error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-white">Couldn’t open stock profile</h1>
      <p className="max-w-md text-sm text-gray-400">
        {error.message || 'An unexpected error occurred while loading this symbol.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:border-white/30"
        >
          Try again
        </button>
        <Link
          href="/dashboard/tokenized-securities"
          className="rounded-lg border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm text-[#00d4aa]"
        >
          Back to board
        </Link>
      </div>
    </div>
  );
}
