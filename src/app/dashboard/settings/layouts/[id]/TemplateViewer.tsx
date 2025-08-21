// src/app/dashboard/settings/layouts/[id]/TemplateViewer.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code2, FileJson, Copy, Check, ExternalLink, Maximize2 } from "lucide-react";
import { useParams } from "next/navigation";

interface TemplateViewerProps {
  template: {
    htmlContent: string;
    metadata: string | null;
  };
  previewHTML: string;
  sampleData: Record<string, string>;
  templateId: string;  // Add this
}

export default function TemplateViewer({ 
  template, 
  previewHTML, 
  sampleData 
}: TemplateViewerProps) {
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const templateId = params.id as string;

  // Parse metadata
  let metadata: any = {};
  if (template.metadata) {
    try {
      metadata = JSON.parse(template.metadata);
    } catch (e) {
      metadata = {};
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(template.htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openFullView = () => {
  window.open(`/api/templates/preview/${templateId}`, '_blank');
  };

  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="preview">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          <Code2 className="h-4 w-4 mr-2" />
          Code
        </TabsTrigger>
        <TabsTrigger value="variables">
          <FileJson className="h-4 w-4 mr-2" />
          Variables
        </TabsTrigger>
      </TabsList>

      {/* Preview Tab */}
      <TabsContent value="preview" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  This preview shows the template with sample data
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openFullView}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Open Full View
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={previewHTML}
                className="w-full h-[600px]"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={openFullView}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in New Tab
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Code Tab */}
      <TabsContent value="code" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>HTML Template Code</CardTitle>
                <CardDescription>
                  Raw HTML template with variable placeholders
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFullView}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Full View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                <code className="text-sm">{template.htmlContent}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Variables Tab */}
      <TabsContent value="variables" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>
                  Variables that can be replaced with actual data
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openFullView}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Full
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metadata.variables && metadata.variables.length > 0 ? (
                <div className="grid gap-3">
                  {metadata.variables.map((variable: string) => (
                    <div
                      key={variable}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <code className="text-sm font-mono">
                          {`{{${variable}}}`}
                        </code>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sample: {sampleData[variable] || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No variables defined for this template
                </p>
              )}

              {metadata.components && metadata.components.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Components Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {metadata.components.map((component: string) => (
                      <Badge key={component} variant="secondary">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}