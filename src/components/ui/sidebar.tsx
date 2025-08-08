"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useSidebar } from "./sidebar-provider" // UPDATED IMPORT

// The context and provider have been moved to sidebar-provider.tsx

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
  variant?: "default" | "floating"
  isMobileSheet?: boolean;
}

export function Sidebar({
  side = "left",
  variant = "default",
  className,
  children,
  isMobileSheet = false,
  ...props
}: SidebarProps) {
  const { open } = useSidebar()

  const isOpen = open || isMobileSheet;

  return (
    <aside
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "relative flex h-full flex-col bg-background transition-all duration-300",
        isOpen ? "w-[260px]" : "w-[60px]",
        variant === "floating" && "m-4 rounded-lg border shadow-sm",
        side === "right" && "order-last",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      {...props}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar();
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        open ? "p-4" : "p-2",
        className
      )}
      {...props}
    />
  )
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar();
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-2 overflow-auto",
        open ? "p-4" : "p-2",
        className
      )}
      {...props}
    />
  )
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar();
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        open ? "p-4" : "p-2",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 py-1 text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
}

export function SidebarMenuItem({
  className,
  isActive,
  ...props
}: SidebarMenuItemProps) {
  return (
    <div
      className={cn(
        "relative flex items-center",
        isActive && "bg-accent",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMenuButton({
  className,
  isActive,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean }) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        isActive && "bg-accent",
        className
      )}
      {...props}
    />
  )
}
