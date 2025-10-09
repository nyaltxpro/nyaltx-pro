import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';

// Generate a unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const pathname = usePathname();
  const { address, connector } = useAccount();
  const sessionId = useRef<string | null>(null);
  const lastTrackedPage = useRef<string>('');

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  // Track page views
  useEffect(() => {
    if (!sessionId.current || pathname === lastTrackedPage.current) return;

    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'page_view',
            page: pathname,
            referrer: document.referrer || null,
            sessionId: sessionId.current,
            walletAddress: address || null,
          }),
        });
        
        lastTrackedPage.current = pathname;
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [pathname, address]);

  // Track wallet connections
  useEffect(() => {
    if (!address || !connector || !sessionId.current) return;

    const trackWalletConnection = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'wallet_connect',
            walletAddress: address,
            walletType: connector.name,
            sessionId: sessionId.current,
            page: pathname,
          }),
        });
      } catch (error) {
        console.error('Failed to track wallet connection:', error);
      }
    };

    trackWalletConnection();
  }, [address, connector, pathname]);

  // Track user activity and handle page unload
  useEffect(() => {
    if (!sessionId.current) return;

    // Update activity on user interactions
    const updateActivity = () => {
      if (!sessionId.current) return;
      
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'activity',
          sessionId: sessionId.current,
          walletAddress: address || null,
        }),
      }).catch(() => {
        // Silently fail for activity updates
      });
    };

    // Track activity on mouse movement, clicks, and key presses
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let activityTimeout: NodeJS.Timeout;

    const throttledUpdateActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateActivity, 30000); // Update every 30 seconds
    };

    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    // Handle page unload
    const handleBeforeUnload = () => {
      if (!sessionId.current) return;
      
      // Use sendBeacon for reliable tracking on page unload
      const data = JSON.stringify({
        sessionId: sessionId.current,
      });
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track?sessionId=' + sessionId.current, data);
      } else {
        // Fallback for browsers that don't support sendBeacon
        fetch(`/api/analytics/track?sessionId=${sessionId.current}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch(() => {
          // Silently fail
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearTimeout(activityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [address]);

  // Custom event tracking function
  const trackEvent = async (eventName: string, eventData?: any) => {
    if (!sessionId.current) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          sessionId: sessionId.current,
          walletAddress: address || null,
          page: pathname,
          data: eventData,
        }),
      });
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  };

  return {
    trackEvent,
    sessionId: sessionId.current,
  };
};
