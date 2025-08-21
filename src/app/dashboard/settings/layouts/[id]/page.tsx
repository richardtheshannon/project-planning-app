// src/app/dashboard/settings/layouts/[id]/page.tsx
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import TemplateViewer from "./TemplateViewer";
import { getTemplate } from "@/lib/template-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LayoutTemplatePage({ params }: PageProps) {
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  // Sample data for template variables
  const sampleData: Record<string, string> = {
    businessName: "SalesField Network",
    businessTagline: "SalesField Network combines cutting-edge artificial intelligence with traditional business consulting values, delivering personalized solutions for Santa Barbara County's unique business landscape.",
    userName: "Richard Shannon",
    totalForecast: "$12,750.00",
    totalProjects: "21",
    activeTasks: "10",
    completedTasks: "0",
    overdueCount: "12",
    thisMonthCount: "11",
    nextMonthCount: "3",
    recentActivity1Title: "New Project: Highline Adventures",
    recentActivity1Date: "8/19/2025",
    recentActivity2Title: "New Task: Update PHP",
    recentActivity2Date: "8/14/2025",
    recentActivity3Title: "New Task: Update joomla",
    recentActivity3Date: "8/14/2025",
    recentActivity4Title: "New Project: Morehouse Mediation",
    recentActivity4Date: "8/14/2025",
  };

  // Replace variables in HTML
  let previewHTML = template.htmlContent;
  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    previewHTML = previewHTML.replace(regex, value);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/layouts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.isDefault && <Badge>Default</Badge>}
          {template.isActive && <Badge variant="default">Active</Badge>}
          <Badge variant="outline">{template.category}</Badge>
        </div>
      </div>

      {/* Template Viewer - Client Component */}
      <TemplateViewer 
        template={{
          htmlContent: template.htmlContent,
          metadata: JSON.stringify({ variables: template.variables })
        }}
        previewHTML={previewHTML}
        sampleData={sampleData}
        templateId={template.id}
      />

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">File Path</dt>
              <dd className="font-mono text-sm">{template.file}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="capitalize">{template.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                {template.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}