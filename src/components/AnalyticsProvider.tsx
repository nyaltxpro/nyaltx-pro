'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // This component automatically tracks analytics using the useAnalytics hook
  useAnalytics();

  return <>{children}</>;
}
