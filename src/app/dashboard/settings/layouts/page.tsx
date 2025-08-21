// src/app/dashboard/settings/layouts/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Settings, Plus } from "lucide-react";
import { getTemplates } from "@/lib/template-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LayoutsPage() {
  const templates = await getTemplates();

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Layout Templates</h2>
          <p className="text-muted-foreground">
            Manage and preview your application layout templates
          </p>
        </div>
      </div>

      {/* Templates by Category */}
      {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">{category} Templates</h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                      {template.isActive && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                  <div className="mt-2">
                    <code className="text-xs text-muted-foreground">File: {template.file}</code>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/settings/layouts/${template.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit in VS Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No templates found</p>
            <p className="text-sm text-muted-foreground">Add templates to src/templates/ directory</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}