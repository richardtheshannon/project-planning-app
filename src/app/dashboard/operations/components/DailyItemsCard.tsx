// src/app/dashboard/operations/components/DailyItemsCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpEnabledTitle } from "@/components/ui/help-enabled-title";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  FileText,
  Repeat,
  LucideIcon,
  Lightbulb, // Added for Feature Request icon
} from "lucide-react";

// ✅ MODIFIED: Added 'Feature Request' to the list of possible types
export interface OperationalItem {
  id: string;
  title: string;
  type: 'Project' | 'Task' | 'Timeline Event' | 'Invoice' | 'Subscription' | 'Feature Request';
  dueDate: Date;
  link: string;
  projectName?: string;
  clientName?: string;
  priority?: string; // Added for Feature Requests
  status?: string; // Added for Feature Requests
  submittedBy?: string; // Added for Feature Requests
}

// ✅ MODIFIED: Added 'Feature Request' to itemTypeDetails
const itemTypeDetails: { [key in OperationalItem['type']]: { icon: LucideIcon, color: string } } = {
  'Project': { icon: Briefcase, color: 'bg-blue-500' },
  'Task': { icon: CheckCircle2, color: 'bg-green-500' },
  'Timeline Event': { icon: Calendar, color: 'bg-purple-500' },
  'Invoice': { icon: FileText, color: 'bg-orange-500' },
  'Subscription': { icon: Repeat, color: 'bg-pink-500' },
  'Feature Request': { icon: Lightbulb, color: 'bg-yellow-500' }, // New entry for Feature Request
};

interface DailyItemsCardProps {
  title: string;
  items: OperationalItem[];
}

// A helper component to render a list of items
const ItemList = ({ items }: { items: OperationalItem[] }) => (
  <ul className="space-y-3 sm:space-y-4">
    {items.map((item) => {
      const { icon: Icon, color } = itemTypeDetails[item.type];
      return (
        <li key={`${item.type}-${item.id}`}>
          <Link href={item.link} className="block p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className={`mt-0.5 sm:mt-1 flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-white ${color}`}>
                <Icon size={14} className="sm:w-4 sm:h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                  <p className="font-semibold text-sm sm:text-base truncate pr-2">{item.title}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                    {/* Show priority badge for Feature Requests */}
                    {item.type === 'Feature Request' && item.priority && (
                      <Badge variant={
                        item.priority === 'High' ? 'destructive' : 
                        item.priority === 'Medium' ? 'default' : 
                        'secondary'
                      } className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                        {item.priority}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                      <span className="hidden sm:inline">{item.type}</span>
                      <span className="sm:hidden">
                        {item.type === 'Timeline Event' ? 'Event' : 
                         item.type === 'Feature Request' ? 'Feature' :
                         item.type}
                      </span>
                    </Badge>
                  </div>
                </div>
                {item.projectName && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Project: {item.projectName}
                  </p>
                )}
                {item.clientName && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Client: {item.clientName}
                  </p>
                )}
                {/* Show submitter for Feature Requests */}
                {item.type === 'Feature Request' && item.submittedBy && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Submitted by: {item.submittedBy}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </li>
      );
    })}
  </ul>
);

export default function DailyItemsCard({ title, items }: DailyItemsCardProps) {
  const projectItems = items.filter(item => ['Project', 'Task', 'Timeline Event', 'Feature Request'].includes(item.type));
  const financialItems = items.filter(item => ['Invoice', 'Subscription'].includes(item.type));

  // Define help content based on the title
  const helpContent = title === 'Today' ? {
    summary: "Shows all tasks due today including feature requests, projects, and other items requiring immediate attention.",
    details: (
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold mb-2">Item Types Displayed</h5>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Projects:</strong> Projects with end dates today</li>
            <li><strong>Tasks:</strong> Tasks with due dates today</li>
            <li><strong>Timeline Events:</strong> Scheduled project milestones for today</li>
            <li><strong>Feature Requests:</strong> Feature requests due today</li>
            <li><strong>Invoices:</strong> Invoices in pending or draft status due for payment today</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-2">Organization</h5>
          <p className="text-sm">Items are grouped into two sections:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Projects & Tasks:</strong> Development and project work</li>
            <li><strong>Financials:</strong> Invoices, subscriptions, and payments</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-2">Actions</h5>
          <p className="text-sm">Click any item to navigate to its detail page for more information or to take action.</p>
        </div>
      </div>
    )
  } : {
    summary: "Shows all tasks due tomorrow to help you plan ahead and prepare for the next day.",
    details: (
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold mb-2">Item Types Displayed</h5>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Projects:</strong> Projects with end dates tomorrow</li>
            <li><strong>Tasks:</strong> Tasks with due dates tomorrow</li>
            <li><strong>Timeline Events:</strong> Scheduled project milestones for tomorrow</li>
            <li><strong>Feature Requests:</strong> Feature requests due tomorrow</li>
            <li><strong>Invoices:</strong> Invoices in pending or draft status due for payment tomorrow</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-2">Organization</h5>
          <p className="text-sm">Items are grouped into two sections:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Projects & Tasks:</strong> Development and project work</li>
            <li><strong>Financials:</strong> Invoices and payments</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-2">Planning Benefits</h5>
          <p className="text-sm mb-2">Tomorrow's view helps you:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Prepare for upcoming deadlines</li>
            <li>Allocate resources in advance</li>
            <li>Identify potential scheduling conflicts</li>
            <li>Plan your workday more effectively</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-2">Actions</h5>
          <p className="text-sm">Click any item to navigate to its detail page for more information or to take action.</p>
        </div>
      </div>
    )
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <HelpEnabledTitle
          title={title}
          summary={helpContent.summary}
          details={helpContent.details}
          className="text-lg sm:text-xl font-semibold"
          as="h3"
        />
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {items.length > 0 ? (
          <>
            {projectItems.length > 0 && (
              <div>
                <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Projects & Tasks</h3>
                <ItemList items={projectItems} />
              </div>
            )}
            {financialItems.length > 0 && (
              <div>
                <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Financials</h3>
                <ItemList items={financialItems} />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">No items due.</p>
        )}
      </CardContent>
    </Card>
  );
}