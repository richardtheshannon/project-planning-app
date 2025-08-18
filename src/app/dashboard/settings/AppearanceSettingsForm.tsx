// src/app/dashboard/settings/AppearanceSettingsForm.tsx

'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { AppearanceSettings, AppearanceSettingsSchema } from "@/lib/schemas/appearance";
import { Loader2, XCircle } from "lucide-react";

// The form schema now includes all fields, including colors, from the lib schema.
const formSchema = AppearanceSettingsSchema.extend({
  lightModeLogoFile: z.any().optional(),
  lightModeIconFile: z.any().optional(),
  darkModeLogoFile: z.any().optional(),
  darkModeIconFile: z.any().optional(),
}).refine((data) => {
  if (typeof window !== 'undefined') {
    const fileFields = ['lightModeLogoFile', 'lightModeIconFile', 'darkModeLogoFile', 'darkModeIconFile'] as const;
    for (const field of fileFields) {
      const value = data[field];
      if (value !== undefined && value !== null && !(value instanceof File)) {
        return false;
      }
    }
  }
  return true;
}, {
  message: "Invalid file type submitted."
});

type AppearanceSettingsFormData = z.infer<typeof formSchema>;
type ImageUrlField = 'lightModeLogoUrl' | 'darkModeLogoUrl' | 'lightModeIconUrl' | 'darkModeIconUrl';
type ImageFileField = 'lightModeLogoFile' | 'darkModeLogoFile' | 'lightModeIconFile' | 'darkModeIconFile';

// Define the color fields for easier mapping
const lightThemeColors = [
  "lightBackground", "lightForeground", "lightCard", "lightCardForeground",
  "lightPopover", "lightPopoverForeground", "lightPrimary", "lightPrimaryForeground",
  "lightSecondary", "lightSecondaryForeground", "lightMuted", "lightMutedForeground",
  "lightAccent", "lightAccentForeground", "lightDestructive", "lightDestructiveForeground",
  "lightBorder", "lightInput", "lightRing"
] as const;

const darkThemeColors = [
  "darkBackground", "darkForeground", "darkCard", "darkCardForeground",
  "darkPopover", "darkPopoverForeground", "darkPrimary", "darkPrimaryForeground",
  "darkSecondary", "darkSecondaryForeground", "darkMuted", "darkMutedForeground",
  "darkAccent", "darkAccentForeground", "darkDestructive", "darkDestructiveForeground",
  "darkBorder", "darkInput", "darkRing"
] as const;


export default function AppearanceSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AppearanceSettingsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      missionStatement: "",
      lightModeLogoUrl: "",
      lightModeIconUrl: "",
      darkModeLogoUrl: "",
      darkModeIconUrl: "",
      // Initialize color fields to prevent uncontrolled component warnings
      ...Object.fromEntries(lightThemeColors.map(key => [key, ''])) as any,
      ...Object.fromEntries(darkThemeColors.map(key => [key, ''])) as any,
    },
  });

  const { reset, watch, setValue, getValues, handleSubmit, control } = form;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: ImageFileField) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        const uploadError = new Error(errorData.error || 'File upload failed');
        (uploadError as any).details = errorData.details || 'No details provided.';
        throw uploadError;
      }
      const data = await response.json();
      if (data.url) {
        const urlField = fieldName.replace('File', 'Url') as ImageUrlField;
        setValue(urlField, data.url, { shouldDirty: true, shouldValidate: true });
        toast({ title: "Upload Successful", description: `Image for ${labelFromFileField(fieldName)} has been uploaded.` });
      }
    } catch (error) {
      const description = error instanceof Error && (error as any).details ? (error as any).details : 'An unknown error occurred.';
      toast({ title: "Upload Error", description, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = (urlField: ImageUrlField) => {
    setValue(urlField, null, { shouldDirty: true, shouldValidate: true });
    toast({ title: "Image Cleared", description: `The image for ${labelFromFileField(urlField.replace('Url', 'File') as ImageFileField)} has been removed.` });
  };

  const onSubmit = async (data: AppearanceSettingsFormData) => {
    console.log(`[FORM] Submitting form. Final data being sent:`, data);
    setIsSubmitting(true);
    try {
      // The payload is now inferred directly from the schema, ensuring all fields are included.
      const payload: AppearanceSettings = AppearanceSettingsSchema.parse(data);
      const response = await fetch('/api/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      const updatedSettings = await response.json();
      reset(updatedSettings);
      toast({ title: "Success", description: "Your appearance settings have been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onInvalid = (errors: any) => console.error('[FORM] Validation Failed:', errors);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/appearance');
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data: AppearanceSettings = await response.json();
        reset(data);
      } catch (error) {
        toast({ title: "Error", description: "Could not load appearance settings.", variant: "destructive" });
      }
    };
    fetchSettings();
  }, [reset, toast]);

  const labelFromFileField = (field: string) => field.replace(/([A-Z])/g, ' $1').replace('File', '').replace('Url', '').trim();
  const formatColorLabel = (field: string) => field.replace(/^(light|dark)/, '').replace(/([A-Z])/g, ' $1').trim();

  const renderImageUpload = (fileField: ImageFileField, urlField: ImageUrlField, label: string, width: number, height: number) => {
    const imageUrl = watch(urlField);
    return (
      <div className="space-y-2">
        <FormLabel className="font-semibold">{label}</FormLabel>
        <div className="flex items-center space-x-4">
          <FormField control={control} name={fileField} render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, fileField)} className="w-auto" disabled={isUploading || isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {imageUrl && typeof imageUrl === 'string' && (
            <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
              <img src={imageUrl} alt={`${label} Preview`} width={width} height={height} className="rounded-md object-contain bg-gray-200" style={{ width: `${width}px`, height: `${height}px` }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <Button type="button" variant="ghost" size="icon" onClick={() => handleClearImage(urlField)} title="Clear Image" disabled={isUploading || isSubmitting}>
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper component for rendering color inputs
  const renderColorInput = (name: keyof AppearanceSettingsFormData, label: string) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between">
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl>
              <Input type="color" {...field} value={field.value ?? ''} className="w-12 h-10 p-1" />
            </FormControl>
            <FormControl>
              <Input type="text" {...field} value={field.value ?? ''} className="w-24 font-mono" placeholder="#000000" />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Branding</h3>
          <FormField control={control} name="businessName" render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl><Input placeholder="Your Company Name" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="missionStatement" render={({ field }) => (
            <FormItem>
              <FormLabel>Business Mission Statement</FormLabel>
              <FormControl><Textarea placeholder="Your company's mission..." {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-6 p-4 border rounded-lg">
          <div>
            <h3 className="text-lg font-medium">Logos & Icons</h3>
            <p className="text-sm text-muted-foreground">Recommended logo size: 496x148px. Recommended icon size: 96x96px.</p>
          </div>
          {renderImageUpload('lightModeLogoFile', 'lightModeLogoUrl', 'Light Mode Logo', 100, 30)}
          {renderImageUpload('darkModeLogoFile', 'darkModeLogoUrl', 'Dark Mode Logo', 100, 30)}
          {renderImageUpload('lightModeIconFile', 'lightModeIconUrl', 'Light Mode Icon', 30, 30)}
          {renderImageUpload('darkModeIconFile', 'darkModeIconUrl', 'Dark Mode Icon', 30, 30)}
        </div>

        {/* *** NEW SECTION ***: Theme Colors */}
        <div className="space-y-6 p-4 border rounded-lg">
          <div>
            <h3 className="text-lg font-medium">Theme Colors</h3>
            <p className="text-sm text-muted-foreground">Customize the color scheme for light and dark modes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold">Light Theme</h4>
              {lightThemeColors.map(color => renderColorInput(color, formatColorLabel(color)))}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Dark Theme</h4>
              {darkThemeColors.map(color => renderColorInput(color, formatColorLabel(color)))}
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting || isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
