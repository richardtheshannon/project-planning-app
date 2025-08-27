'use client';

import { useState, useEffect } from 'react';

interface NotificationSettings {
  enableCloseableNotifications: boolean;
  closedNotifications: string[];
}

export function useCloseableNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enableCloseableNotifications: false,
    closedNotifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/users/settings');
      const data = await response.json();
      setSettings({
        enableCloseableNotifications: data.enableCloseableNotifications ?? false,
        closedNotifications: data.closedNotifications ?? []
      });
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setSettings(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const resetNotifications = async () => {
    await updateSettings({ closedNotifications: [] });
  };

  return {
    ...settings,
    loading,
    updateSettings,
    resetNotifications,
    refetchSettings: fetchSettings
  };
}