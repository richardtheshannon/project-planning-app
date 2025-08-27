'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { HelpDrawer } from './help-drawer';
import { useHelpMode } from '@/hooks/use-help-mode';

interface HelpEnabledTitleProps {
  title: string;
  summary: string;
  details: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4' | 'p';
}

export function HelpEnabledTitle({
  title,
  summary,
  details,
  className,
  as: Component = 'h3'
}: HelpEnabledTitleProps) {
  const { isHelpModeEnabled } = useHelpMode();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isHelpModeEnabled) {
    return <Component className={className}>{title}</Component>;
  }

  return (
    <HelpDrawer
      trigger={
        <button
          className={cn(
            "text-left transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
            "text-primary", // This will use your accent color
            className
          )}
          type="button"
        >
          <Component className="underline decoration-dashed underline-offset-4 decoration-primary/50">
            {title}
          </Component>
        </button>
      }
      title={title}
      summary={summary}
      details={details}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}