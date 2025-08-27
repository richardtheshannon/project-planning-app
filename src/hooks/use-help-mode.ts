'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useHelpMode() {
  const { data: session } = useSession();
  const [isHelpModeEnabled, setIsHelpModeEnabled] = useState(false);

  useEffect(() => {
    const fetchHelpModeStatus = async () => {
      if (!session?.user?.id) {
        setIsHelpModeEnabled(false);
        return;
      }

      try {
        const response = await fetch('/api/users/settings');
        if (response.ok) {
          const data = await response.json();
          setIsHelpModeEnabled(data.enableCloseableNotifications ?? true);
        }
      } catch (error) {
        console.error('Failed to fetch help mode status:', error);
        setIsHelpModeEnabled(false);
      }
    };

    fetchHelpModeStatus();
  }, [session?.user?.id]);

  return { isHelpModeEnabled };
}