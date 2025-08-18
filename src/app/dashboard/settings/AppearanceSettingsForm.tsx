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

// Extended schema to include file fields for the form state.
// These are not part of the database model but are used for client-side validation.
const formSchema = AppearanceSettingsSchema.extend({
  lightModeLogoFile: z.any().optional(),
  lightModeIconFile: z.any().optional(),
  darkModeLogoFile: z.any().optional(),
  darkModeIconFile: z.any().optional(),
}).refine((data) => {
  // In the browser, ensure that if a file field is present, it is a File object.
  if (typeof window !== 'undefined') {
    const fileFields = ['lightModeLogoFile', 'lightModeIconFile', 'darkModeLogoFile', 'darkModeIconFile'] as const;
    for (const field of fileFields) {
      const value = data[field];
      // The value can be undefined, null, or a File object. Anything else is invalid.
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
    },
  });

  const { reset, watch, setValue, getValues, handleSubmit, control } = form;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: ImageFileField) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`[FORM] File selected for ${fieldName}, starting upload.`);
    
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const data = await response.json();
      console.log(`[FORM] Upload successful for ${fieldName}. Response:`, data);
      
      if (data.url) {
        const urlField = fieldName.replace('File', 'Url') as ImageUrlField;
        setValue(urlField, data.url, { shouldDirty: true, shouldValidate: true });
        
        console.log(`[FORM] Set value for ${urlField}: ${data.url}`);
        console.log('[FORM] Current form values after setValue:', getValues());

        toast({
          title: "Upload Successful",
          description: `Image for ${labelFromFileField(fieldName)} has been uploaded.`,
        });
      }
    } catch (error) {
      console.error(`[FORM] Upload error for ${fieldName}:`, error);
      toast({
        title: "Upload Error",
        description: `Failed to upload file. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = (urlField: ImageUrlField) => {
    setValue(urlField, null, { shouldDirty: true, shouldValidate: true });
    console.log(`[FORM] Cleared image for ${urlField}`);
    toast({
      title: "Image Cleared",
      description: `The image for ${labelFromFileField(urlField.replace('Url', 'File') as ImageFileField)} has been removed.`
    });
  };

  // This is our function that will run if validation passes.
  const onSubmit = async (data: AppearanceSettingsFormData) => {
    console.log(`[FORM] Submitting form. Final data being sent:`, data);
    
    setIsSubmitting(true);
    try {
      const payload: AppearanceSettings = {
        businessName: data.businessName,
        missionStatement: data.missionStatement,
        lightModeLogoUrl: data.lightModeLogoUrl,
        lightModeIconUrl: data.lightModeIconUrl,
        darkModeLogoUrl: data.darkModeLogoUrl,
        darkModeIconUrl: data.darkModeIconUrl,
      };

      console.log(`[FORM] Sending this payload to /api/appearance:`, payload);

      const response = await fetch('/api/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FORM] API error response:`, errorText);
        throw new Error('Failed to save settings');
      }

      const updatedSettings = await response.json();
      console.log(`[FORM] API success response:`, updatedSettings);
      
      reset(updatedSettings);
      toast({
        title: "Success",
        description: "Your appearance settings have been saved.",
      });
    } catch (error) {
      console.error("[FORM] Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // *** NEW ***: This function will run if validation fails.
  const onInvalid = (errors: any) => {
    console.error('[FORM] Validation Failed:', errors);
    toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive"
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log(`[FORM] Fetching initial settings...`);
        const response = await fetch('/api/appearance');
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data: AppearanceSettings = await response.json();
        console.log(`[FORM] Loaded settings:`, data);
        reset(data);
      } catch (error) {
        console.error("[FORM] Failed to fetch appearance settings:", error);
        toast({
            title: "Error",
            description: "Could not load appearance settings.",
            variant: "destructive"
        });
      }
    };
    fetchSettings();
  }, [reset, toast]);

  const labelFromFileField = (field: string) => {
    return field.replace(/([A-Z])/g, ' $1').replace('File', '').replace('Url', '').trim();
  }

  const renderImageUpload = (fileField: ImageFileField, urlField: ImageUrlField, label: string, width: number, height: number) => {
    const imageUrl = watch(urlField);
    
    return (
      <div className="space-y-2">
        <FormLabel className="font-semibold">{label}</FormLabel>
        <div className="flex items-center space-x-4">
          <FormField
            control={control}
            name={fileField}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={(e) => handleFileChange(e, fileField)}
                    className="w-auto"
                    disabled={isUploading || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {imageUrl && typeof imageUrl === 'string' && (
            <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
              <img
                src={imageUrl}
                alt={`${label} Preview`}
                width={width}
                height={height}
                className="rounded-md object-contain bg-gray-200"
                style={{ width: `${width}px`, height: `${height}px` }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleClearImage(urlField)}
                title="Clear Image"
                disabled={isUploading || isSubmitting}
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      {/* *** UPDATED ***: We now pass our new onInvalid function to handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Branding</h3>
          <FormField
            control={control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Company Name" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="missionStatement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Mission Statement</FormLabel>
                <FormControl>
                  <Textarea placeholder="Your company's mission..." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6 p-4 border rounded-lg">
          <div>
            <h3 className="text-lg font-medium">Logos & Icons</h3>
            <p className="text-sm text-muted-foreground">
              Recommended logo size: 496x148px. Recommended icon size: 96x96px.
            </p>
          </div>

          {renderImageUpload('lightModeLogoFile', 'lightModeLogoUrl', 'Light Mode Logo', 100, 30)}
          {renderImageUpload('darkModeLogoFile', 'darkModeLogoUrl', 'Dark Mode Logo', 100, 30)}
          {renderImageUpload('lightModeIconFile', 'lightModeIconUrl', 'Light Mode Icon', 30, 30)}
          {renderImageUpload('darkModeIconFile', 'darkModeIconUrl', 'Dark Mode Icon', 30, 30)}
        </div>
        
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
