"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";

// Define a type for the settings to ensure type safety
type AppearanceSettings = {
  lightModeLogoUrl?: string | null;
  darkModeLogoUrl?: string | null;
};

export default function LandingPage() {
  const [settings, setSettings] = useState<AppearanceSettings>({});

  // Fetch appearance settings when the component mounts
  useEffect(() => {
    const fetchAppearanceSettings = async () => {
      try {
        const response = await fetch('/api/appearance');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error("Failed to fetch appearance settings for landing page.");
        }
      } catch (error) {
        console.error("Error fetching appearance settings:", error);
      }
    };

    fetchAppearanceSettings();
  }, []);

  // Construct the correct URL to use our new file-serving API route.
  const lightLogoSrc = settings.lightModeLogoUrl 
    ? `/logos/${settings.lightModeLogoUrl.split('/').pop()}` 
    : null;

  const darkLogoSrc = settings.darkModeLogoUrl 
    ? `/logos/${settings.darkModeLogoUrl.split('/').pop()}` 
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-md flex-col items-center text-center lg:max-w-none">
        
        <div className="mb-8 h-[115px] flex items-center justify-center">
          {/* Conditionally render logos based on the new src variables */}
          {lightLogoSrc && (
            <Image
              className="block dark:hidden"
              src={lightLogoSrc}
              alt="Company Logo"
              width={400}
              height={115}
              priority
            />
          )}
          {darkLogoSrc && (
            <Image
              className="hidden dark:block"
              src={darkLogoSrc}
              alt="Company Logo"
              width={400}
              height={115}
              priority
            />
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Project Planning & Management
        </h1>
        
        {/* Desktop layout: theme toggle inline with buttons */}
        <div className="mt-8 hidden sm:flex items-center justify-center gap-4">
          <ThemeToggle />
          <Link href="/auth/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg">
              Log In
            </Button>
          </Link>
        </div>

        {/* Mobile layout: buttons first, theme toggle below */}
        <div className="mt-8 flex sm:hidden flex-col items-center gap-4">
          <div className="flex gap-4">
            <Link href="/auth/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">
                Log In
              </Button>
            </Link>
          </div>
          <ThemeToggle />
        </div>

        <p className="mt-8 text-lg text-muted-foreground">
          Streamline your workflow, manage tasks, and collaborate with your team
          all in one place.
        </p>

      </div>
    </div>
  );
}