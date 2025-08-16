// src/app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button"; // Import the Button component
import { Moon, Sun, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLayoutPreference } from '@/lib/hooks/use-layout-preference';
import { useToast } from '@/components/ui/use-toast';

// Interface for the notification settings we'll fetch
interface UserSettings {
  sendDailyManifest: boolean;
}

export default function SettingsPage() {
  // --- Existing State for Appearance ---
  const { theme, setTheme } = useTheme();
  const { preference, setPreference } = useLayoutPreference();
  
  // --- State for Notification Settings ---
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // New state for manual send button
  const { toast } = useToast();

  // Fetch all settings when the component mounts
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

  // --- Handlers for Appearance ---
  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };
  
  const handleLayoutChange = (value: 'left-handed' | 'right-handed') => {
    setPreference(value);
  };

  // --- Handler for Notification Settings Toggle ---
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
        description: 'Your settings have been updated.',
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

  // --- NEW: Handler for Manual Manifest Send ---
  const handleSendManualManifest = async () => {
    setIsSending(true);
    try {
      // We use POST to trigger the action of sending an email
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
      setIsSending(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* --- Notifications Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="daily-manifest" className="text-base">
                  Daily Morning Manifest
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive an email every morning with a summary of items due for the day.
                </p>
              </div>
              {/* Container for Button and Switch */}
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleSendManualManifest}
                  disabled={isSending}
                  size="sm"
                >
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          </CardContent>
        </Card>

        {/* --- Existing Appearance Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks and feels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="layout-preference" className="text-base font-medium">
                  Handedness
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred navigation sidebar position.
                </p>
              </div>
              <RadioGroup
                value={preference}
                onValueChange={handleLayoutChange}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left-handed" id="left-handed" />
                  <Label htmlFor="left-handed">Left-handed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right-handed" id="right-handed" />
                  <Label htmlFor="right-handed">Right-handed</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* --- Existing About Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Information about your Project Planning Application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Version</span>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Framework</span>
                <span className="text-sm text-muted-foreground">Next.js 13.5.6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-muted-foreground">MySQL with Prisma</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
