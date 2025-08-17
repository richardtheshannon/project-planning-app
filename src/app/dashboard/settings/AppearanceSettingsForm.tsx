'use client';

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Upload, Loader2, RefreshCw } from 'lucide-react';

// Define a type for the settings object for type safety
type AppearanceSettings = {
  businessName?: string;
  missionStatement?: string;
  lightModeLogoUrl?: string;
  lightModeIconUrl?: string;
  darkModeLogoUrl?: string;
  darkModeIconUrl?: string;

  // Light Theme Colors
  lightBackground?: string;
  lightForeground?: string;
  lightCard?: string;
  lightCardForeground?: string;
  lightPopover?: string;
  lightPopoverForeground?: string;
  lightPrimary?: string;
  lightPrimaryForeground?: string;
  lightSecondary?: string;
  lightSecondaryForeground?: string;
  lightMuted?: string;
  lightMutedForeground?: string;
  lightAccent?: string;
  lightAccentForeground?: string;
  lightDestructive?: string;
  lightDestructiveForeground?: string;
  lightBorder?: string;
  lightInput?: string;
  lightRing?: string;

  // Dark Theme Colors
  darkBackground?: string;
  darkForeground?: string;
  darkCard?: string;
  darkCardForeground?: string;
  darkPopover?: string;
  darkPopoverForeground?: string;
  darkPrimary?: string;
  darkPrimaryForeground?: string;
  darkSecondary?: string;
  darkSecondaryForeground?: string;
  darkMuted?: string;
  darkMutedForeground?: string;
  darkAccent?: string;
  darkAccentForeground?: string;
  darkDestructive?: string;
  darkDestructiveForeground?: string;
  darkBorder?: string;
  darkInput?: string;
  darkRing?: string;
};

// --- Default color values based on the Prisma schema ---
const defaultColors = {
  lightBackground: "#ffffff",
  lightForeground: "#020817",
  lightCard: "#ffffff",
  lightCardForeground: "#020817",
  lightPopover: "#ffffff",
  lightPopoverForeground: "#020817",
  lightPrimary: "#18181b",
  lightPrimaryForeground: "#fafafa",
  lightSecondary: "#f4f4f5",
  lightSecondaryForeground: "#18181b",
  lightMuted: "#f4f4f5",
  lightMutedForeground: "#71717a",
  lightAccent: "#f4f4f5",
  lightAccentForeground: "#18181b",
  lightDestructive: "#ef4444",
  lightDestructiveForeground: "#fafafa",
  lightBorder: "#e4e4e7",
  lightInput: "#e4e4e7",
  lightRing: "#18181b",
  darkBackground: "#09090b",
  darkForeground: "#fafafa",
  darkCard: "#09090b",
  darkCardForeground: "#fafafa",
  darkPopover: "#09090b",
  darkPopoverForeground: "#fafafa",
  darkPrimary: "#fafafa",
  darkPrimaryForeground: "#18181b",
  darkSecondary: "#27272a",
  darkSecondaryForeground: "#fafafa",
  darkMuted: "#27272a",
  darkMutedForeground: "#a1a1aa",
  darkAccent: "#27272a",
  darkAccentForeground: "#fafafa",
  darkDestructive: "#7f1d1d",
  darkDestructiveForeground: "#fafafa",
  darkBorder: "#27272a",
  darkInput: "#27272a",
  darkRing: "#d4d4d8",
};


// --- New Reusable Image Upload Component ---
function ImageUploadField({
  label,
  currentUrl,
  onUploadComplete,
}: {
  label: string;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      onUploadComplete(result.path);
    } catch (err: any) {
      setError(err.message);
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md border flex items-center justify-center bg-muted overflow-hidden">
          {currentUrl ? (
            <Image src={currentUrl} alt={`${label} Preview`} width={64} height={64} className="object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">Preview</span>
          )}
        </div>
        <div className="flex-1">
          <Button asChild variant="outline" size="sm" disabled={isUploading}>
            <label className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/png, image/jpeg, image/gif, image/svg+xml" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            </label>
          </Button>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}


export default function AppearanceSettingsForm() {
  const [settings, setSettings] = useState<AppearanceSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  // Fetch initial settings from the API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/appearance');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error('Failed to fetch appearance settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle color input changes specifically
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  // --- NEW: Handle resetting colors to default ---
  const handleResetColors = () => {
    setSettings(prev => ({
        ...prev, // Keep existing settings like logos and business name
        ...defaultColors // Overwrite only the color values
    }));
  };

  // Save settings to the API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/appearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
        window.location.reload();
      } else {
        alert('Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the application looks and feels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Theme</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                        Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                        id="dark-mode"
                        checked={theme === "dark"}
                        onCheckedChange={handleThemeToggle}
                    />
                    <Moon className="h-4 w-4" />
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Branding</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                value={settings.businessName || ''}
                onChange={handleChange}
                placeholder="Your Company Inc."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="missionStatement">Business Mission Statement</Label>
              <Textarea
                id="missionStatement"
                name="missionStatement"
                value={settings.missionStatement || ''}
                onChange={handleChange}
                placeholder="To boldly go where no one has gone before."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Logos & Icons</h3>
          <p className="text-sm text-muted-foreground">
            Recommended logo size: 496px wide x 148px high. Recommended icon size: 96px wide x 96px high.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImageUploadField 
              label="Light Mode Logo" 
              currentUrl={settings.lightModeLogoUrl} 
              onUploadComplete={(url) => setSettings(prev => ({...prev, lightModeLogoUrl: url}))}
            />
            <ImageUploadField 
              label="Light Mode Icon" 
              currentUrl={settings.lightModeIconUrl} 
              onUploadComplete={(url) => setSettings(prev => ({...prev, lightModeIconUrl: url}))}
            />
            <ImageUploadField 
              label="Dark Mode Logo" 
              currentUrl={settings.darkModeLogoUrl} 
              onUploadComplete={(url) => setSettings(prev => ({...prev, darkModeLogoUrl: url}))}
            />
            <ImageUploadField 
              label="Dark Mode Icon" 
              currentUrl={settings.darkModeIconUrl} 
              onUploadComplete={(url) => setSettings(prev => ({...prev, darkModeIconUrl: url}))}
            />
          </div>
        </div>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Light Theme Colors</h3>
                <Button variant="outline" size="sm" onClick={handleResetColors}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Colors
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 md:grid-cols-3 lg:grid-cols-4">
                <ColorInput label="Background" name="lightBackground" value={settings.lightBackground} onChange={handleColorChange} />
                <ColorInput label="Foreground" name="lightForeground" value={settings.lightForeground} onChange={handleColorChange} />
                <ColorInput label="Card" name="lightCard" value={settings.lightCard} onChange={handleColorChange} />
                <ColorInput label="Card Foreground" name="lightCardForeground" value={settings.lightCardForeground} onChange={handleColorChange} />
                <ColorInput label="Primary" name="lightPrimary" value={settings.lightPrimary} onChange={handleColorChange} />
                <ColorInput label="Primary Foreground" name="lightPrimaryForeground" value={settings.lightPrimaryForeground} onChange={handleColorChange} />
                <ColorInput label="Secondary" name="lightSecondary" value={settings.lightSecondary} onChange={handleColorChange} />
                <ColorInput label="Secondary Foreground" name="lightSecondaryForeground" value={settings.lightSecondaryForeground} onChange={handleColorChange} />
                <ColorInput label="Muted" name="lightMuted" value={settings.lightMuted} onChange={handleColorChange} />
                <ColorInput label="Muted Foreground" name="lightMutedForeground" value={settings.lightMutedForeground} onChange={handleColorChange} />
                <ColorInput label="Accent" name="lightAccent" value={settings.lightAccent} onChange={handleColorChange} />
                <ColorInput label="Accent Foreground" name="lightAccentForeground" value={settings.lightAccentForeground} onChange={handleColorChange} />
                <ColorInput label="Border" name="lightBorder" value={settings.lightBorder} onChange={handleColorChange} />
                <ColorInput label="Input" name="lightInput" value={settings.lightInput} onChange={handleColorChange} />
                <ColorInput label="Ring" name="lightRing" value={settings.lightRing} onChange={handleColorChange} />
            </div>
            <div>
                <h3 className="text-lg font-medium">Dark Theme Colors</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 md:grid-cols-3 lg:grid-cols-4">
                    <ColorInput label="Background" name="darkBackground" value={settings.darkBackground} onChange={handleColorChange} />
                    <ColorInput label="Foreground" name="darkForeground" value={settings.darkForeground} onChange={handleColorChange} />
                    <ColorInput label="Card" name="darkCard" value={settings.darkCard} onChange={handleColorChange} />
                    <ColorInput label="Card Foreground" name="darkCardForeground" value={settings.darkCardForeground} onChange={handleColorChange} />
                    <ColorInput label="Primary" name="darkPrimary" value={settings.darkPrimary} onChange={handleColorChange} />
                    <ColorInput label="Primary Foreground" name="darkPrimaryForeground" value={settings.darkPrimaryForeground} onChange={handleColorChange} />
                    <ColorInput label="Secondary" name="darkSecondary" value={settings.darkSecondary} onChange={handleColorChange} />
                    <ColorInput label="Secondary Foreground" name="darkSecondaryForeground" value={settings.darkSecondaryForeground} onChange={handleColorChange} />
                    <ColorInput label="Muted" name="darkMuted" value={settings.darkMuted} onChange={handleColorChange} />
                    <ColorInput label="Muted Foreground" name="darkMutedForeground" value={settings.darkMutedForeground} onChange={handleColorChange} />
                    <ColorInput label="Accent" name="darkAccent" value={settings.darkAccent} onChange={handleColorChange} />
                    <ColorInput label="Accent Foreground" name="darkAccentForeground" value={settings.darkAccentForeground} onChange={handleColorChange} />
                    <ColorInput label="Border" name="darkBorder" value={settings.darkBorder} onChange={handleColorChange} />
                    <ColorInput label="Input" name="darkInput" value={settings.darkInput} onChange={handleColorChange} />
                    <ColorInput label="Ring" name="darkRing" value={settings.darkRing} onChange={handleColorChange} />
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for color inputs to reduce repetition
function ColorInput({ label, name, value, onChange }: { label: string; name: string; value?: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) {
    return (
        <div className="flex items-center justify-start space-x-2">
            <Input
                id={name}
                name={name}
                type="color"
                value={value || '#ffffff'}
                onChange={onChange}
                className="w-10 h-10 p-1"
            />
            <Label htmlFor={name} className="text-sm">{label}</Label>
        </div>
    );
}
