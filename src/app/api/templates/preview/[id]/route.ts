// src/app/api/templates/preview/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/template-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getTemplate(params.id);

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
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
    let htmlContent = template.htmlContent;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
    });

    // Return HTML with proper content type
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error("Error serving template preview:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}