"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppearanceSettingsForm from '../AppearanceSettingsForm';

export default function BrandingPage() {
  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <AppearanceSettingsForm />

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Your Application</CardTitle>
          <CardDescription>
            System information and version details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Framework</span>
              <span className="text-sm text-muted-foreground">Next.js 13.5.6</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Database</span>
              <span className="text-sm text-muted-foreground">MySQL with Prisma</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">UI Library</span>
              <span className="text-sm text-muted-foreground">Shadcn/ui with Tailwind</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium">Deployment</span>
              <span className="text-sm text-muted-foreground">Railway</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}