"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { useCloseableNotifications } from '@/lib/hooks/useCloseableNotifications';

interface UserSettings {
  sendDailyManifest: boolean;
  sendAfternoonManifest: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMorning, setIsSendingMorning] = useState(false);
  const [isSendingAfternoon, setIsSendingAfternoon] = useState(false);
  const { toast } = useToast();
  
  const {
    enableCloseableNotifications,
    closedNotifications,
    loading: notificationLoading,
    updateSettings: updateNotificationSettings,
    resetNotifications
  } = useCloseableNotifications();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/users/settings');
        if (!response.ok) throw new Error('Failed to fetch settings.');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not load your notification settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSettingChange = async (key: keyof UserSettings, value: boolean) => {
    if (!settings) return;

    const originalSettings = { ...settings };
    setSettings(prev => prev ? { ...prev, [key]: value } : null);

    try {
      const response = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) throw new Error('Failed to save setting.');

      toast({
        title: 'Success',
        description: 'Your notification settings have been updated.',
      });
    } catch (error) {
      setSettings(originalSettings);
      toast({
        title: 'Error',
        description: 'Could not save your setting. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendMorningManifest = async () => {
    setIsSendingMorning(true);
    try {
      const response = await fetch('/api/cron/send-manifest', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send manifest.');
      }

      toast({
        title: 'Success!',
        description: 'The morning manifest has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send the manifest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingMorning(false);
    }
  };

  const handleSendAfternoonManifest = async () => {
    setIsSendingAfternoon(true);
    try {
      const response = await fetch('/api/cron/send-afternoon-manifest', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send afternoon manifest.');
      }

      toast({
        title: 'Success!',
        description: 'The afternoon manifest has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send the afternoon manifest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingAfternoon(false);
    }
  };

  const handleCloseableNotificationToggle = async () => {
    await updateNotificationSettings({
      enableCloseableNotifications: !enableCloseableNotifications
    });
  };

  if (isLoading || notificationLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4">Loading notification settings...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Configure when and how you receive email notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 rounded-lg border p-4">
          <div className="space-y-0.5 flex-grow">
            <Label htmlFor="daily-manifest" className="text-base">
              Daily Morning Manifest
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive an email every morning with a summary of items due for the day.
            </p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Button 
              onClick={handleSendMorningManifest}
              disabled={isSendingMorning}
              size="sm"
              variant="outline"
            >
              {isSendingMorning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Now
            </Button>
            <Switch
              id="daily-manifest"
              checked={settings?.sendDailyManifest || false}
              onCheckedChange={(value) => handleSettingChange('sendDailyManifest', value)}
              disabled={!settings}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 rounded-lg border p-4">
          <div className="space-y-0.5 flex-grow">
            <Label htmlFor="afternoon-manifest" className="text-base">
              Daily Afternoon Manifest
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive an email every afternoon with a summary of items due for tomorrow.
            </p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Button 
              onClick={handleSendAfternoonManifest}
              disabled={isSendingAfternoon}
              size="sm"
              variant="outline"
            >
              {isSendingAfternoon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Now
            </Button>
            <Switch
              id="afternoon-manifest"
              checked={settings?.sendAfternoonManifest || false}
              onCheckedChange={(value) => handleSettingChange('sendAfternoonManifest', value)}
              disabled={!settings}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 rounded-lg border p-4">
          <div className="space-y-0.5 flex-grow">
            <Label htmlFor="closeable-notifications" className="text-base">
              Enable Closeable Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Show helpful information about graphs and data throughout the application
            </p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Switch
              id="closeable-notifications"
              checked={enableCloseableNotifications || false}
              onCheckedChange={handleCloseableNotificationToggle}
            />
          </div>
        </div>
        
        {enableCloseableNotifications && closedNotifications.length > 0 && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {closedNotifications.length} notification{closedNotifications.length !== 1 ? 's' : ''} hidden
              </p>
              <Button
                onClick={resetNotifications}
                size="sm"
                variant="outline"
              >
                Reset all notifications
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}