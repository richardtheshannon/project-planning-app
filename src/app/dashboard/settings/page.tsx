// src/app/dashboard/settings/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes" // Step 1: Corrected the import path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Step 2: Added a check to ensure the component is mounted on the client
  // This prevents hydration errors with the theme switcher.
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  // We wait until the component is mounted to render it
  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        {/* Step 3: Updated heading to use theme-aware text colors */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and settings.
        </p>
      </div>

      <div className="grid gap-6">
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
                  Switch between light and dark themes. Your preference will be saved for this session.
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
          </CardContent>
        </Card>

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
  )
}
