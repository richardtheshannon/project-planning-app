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
import { useEffect, useState, useCallback } from "react";
import { AppearanceSettings, AppearanceSettingsSchema } from "@/lib/schemas/appearance";
import { Loader2, XCircle } from "lucide-react";

// Extended schema to include file fields for the form state.
// These fields are for handling file inputs in the UI and are not part of the database model.
// We use z.any() during SSR and refine it to File in the browser
const formSchema = AppearanceSettingsSchema.extend({
  lightModeLogoFile: z.any().optional(),
  lightModeIconFile: z.any().optional(),
  darkModeLogoFile: z.any().optional(),
  darkModeIconFile: z.any().optional(),
}).refine((data) => {
  // Only validate File instances in the browser
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
  message: "Invalid file type"
});

// Infer the TypeScript type for our form data from the extended Zod schema.
type AppearanceSettingsFormData = z.infer<typeof formSchema> & {
  lightModeLogoFile?: File;
  lightModeIconFile?: File;
  darkModeLogoFile?: File;
  darkModeIconFile?: File;
};

// Define the specific keys that represent file URLs in our form data.
type ImageUrlField = 'lightModeLogoUrl' | 'darkModeLogoUrl' | 'lightModeIconUrl' | 'darkModeIconUrl';
// Define the specific keys that represent file inputs.
type ImageFileField = 'lightModeLogoFile' | 'darkModeLogoFile' | 'lightModeIconFile' | 'darkModeIconFile';


export default function AppearanceSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AppearanceSettingsFormData>({
    resolver: zodResolver(formSchema),
    // Set default values to prevent "uncontrolled component" warnings.
    defaultValues: {
      businessName: "",
      missionStatement: "",
      lightModeLogoUrl: "",
      lightModeIconUrl: "",
      darkModeLogoUrl: "",
      darkModeIconUrl: "",
    },
  });

  const { reset, watch, setValue, getValues } = form;

  // Function to handle file uploads.
  // Using useCallback to memoize the function for stability.
  const handleFileUpload = useCallback(async (file: File, fieldName: ImageFileField) => {
    if (!file) return;

    console.log(`[FORM] Starting upload for ${fieldName}`);
    const formData = new FormData();
    formData.append('file', file);
    // We send the fieldName to the API to know which image is being uploaded.
    formData.append('field', fieldName);

    try {
      setIsUploading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      console.log(`[FORM] Upload response:`, data);
      
      if (data.url) {
        // Construct the corresponding URL field name from the file field name.
        // e.g., 'lightModeLogoFile' becomes 'lightModeLogoUrl'
        const urlField = fieldName.replace('File', 'Url') as ImageUrlField;
        setValue(urlField, data.url, { shouldDirty: true, shouldValidate: true });
        
        // Log the current form values after setting
        console.log(`[FORM] Set ${urlField} to ${data.url}`);
        console.log(`[FORM] Current form values:`, getValues());
        
        toast({
          title: "Success",
          description: `${fieldName.replace('File', '')} uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error(`[FORM] Upload error:`, error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [setValue, toast, getValues]);

  // Function to clear a specific image field.
  const handleClearImage = (fieldName: ImageUrlField) => {
    // Set the URL value to null to remove the image.
    setValue(fieldName, null, { shouldDirty: true });
    console.log(`[FORM] Cleared ${fieldName}`);
  };

  // Main form submission handler.
  const onSubmit = async (data: AppearanceSettingsFormData) => {
    console.log(`[FORM] Submitting form with data:`, data);
    setIsSubmitting(true);
    try {
      // We only send the data defined in the original AppearanceSettingsSchema to the API.
      const payload: AppearanceSettings = {
        businessName: data.businessName,
        missionStatement: data.missionStatement,
        lightModeLogoUrl: data.lightModeLogoUrl,
        lightModeIconUrl: data.lightModeIconUrl,
        darkModeLogoUrl: data.darkModeLogoUrl,
        darkModeIconUrl: data.darkModeIconUrl,
      };

      console.log(`[FORM] Sending payload to API:`, payload);

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
      
      reset(updatedSettings); // Reset form with fresh data from the server.
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

  // Fetch initial settings on component mount.
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log(`[FORM] Fetching initial settings...`);
        const response = await fetch('/api/appearance');
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data: AppearanceSettings = await response.json();
        console.log(`[FORM] Loaded settings:`, data);
        reset(data); // Populate form with fetched data.
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

  // Watch for changes to file inputs and trigger uploads.
  const lightModeLogoFile = watch('lightModeLogoFile');
  const darkModeLogoFile = watch('darkModeLogoFile');
  const lightModeIconFile = watch('lightModeIconFile');
  const darkModeIconFile = watch('darkModeIconFile');

  useEffect(() => {
    if (lightModeLogoFile && lightModeLogoFile instanceof File && lightModeLogoFile.size > 0) {
      handleFileUpload(lightModeLogoFile, 'lightModeLogoFile');
    }
  }, [lightModeLogoFile, handleFileUpload]);

  useEffect(() => {
    if (darkModeLogoFile && darkModeLogoFile instanceof File && darkModeLogoFile.size > 0) {
      handleFileUpload(darkModeLogoFile, 'darkModeLogoFile');
    }
  }, [darkModeLogoFile, handleFileUpload]);

  useEffect(() => {
    if (lightModeIconFile && lightModeIconFile instanceof File && lightModeIconFile.size > 0) {
      handleFileUpload(lightModeIconFile, 'lightModeIconFile');
    }
  }, [lightModeIconFile, handleFileUpload]);

  useEffect(() => {
    if (darkModeIconFile && darkModeIconFile instanceof File && darkModeIconFile.size > 0) {
      handleFileUpload(darkModeIconFile, 'darkModeIconFile');
    }
  }, [darkModeIconFile, handleFileUpload]);

  // Helper function to render image upload fields.
  const renderImageUpload = (fileField: ImageFileField, urlField: ImageUrlField, label: string, width: number, height: number) => {
    const imageUrl = watch(urlField);
    console.log(`[FORM] Rendering ${urlField}:`, imageUrl);
    
    return (
      <div>
        <FormLabel className="font-semibold">{label}</FormLabel>
        <div className="flex items-center space-x-2 mt-2">
          <FormField
            control={form.control}
            name={fileField}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      console.log(`[FORM] File selected for ${fileField}:`, file?.name);
                      field.onChange(file);
                    }}
                    className="w-auto"
                    disabled={isUploading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {imageUrl && typeof imageUrl === 'string' && (
            <div className="flex items-center space-x-2">
              <img
                src={imageUrl}
                alt={`${label} Preview`}
                width={width}
                height={height}
                className="rounded-md object-contain bg-gray-200"
                style={{ width: `${width}px`, height: `${height}px` }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleClearImage(urlField)}
                title="Clear Image"
                disabled={isUploading}
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Branding section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Branding</h3>
          <FormField
            control={form.control}
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
            control={form.control}
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

        {/* Logos & Icons section */}
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