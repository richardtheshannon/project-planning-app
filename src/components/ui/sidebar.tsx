"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SidebarProvider({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: SidebarProviderProps) {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)

  const open = openProp !== undefined ? openProp : _open
  
  const setOpen: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
    (value) => {
      const newValue = typeof value === "function" ? value(open) : value
      if (onOpenChange) {
        onOpenChange(newValue)
      } else {
        _setOpen(value)
      }
    },
    [open, onOpenChange]
  )

  React.useEffect(() => {
    const checkMobile = () => {
      const isMobileNow = window.innerWidth < 768;
      setIsMobile(isMobileNow);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

// UPDATED: Added isMobileSheet to the props
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
  isMobileSheet = false, // Destructure the new prop
  ...props
}: SidebarProps) {
  const { open } = useSidebar()

  // UPDATED: The condition for width now also checks if it's the mobile sheet
  const isOpen = open || isMobileSheet;

  return (
    <aside
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "relative flex h-full flex-col bg-background transition-all duration-300",
        isOpen ? "w-[260px]" : "w-[60px]", // Use the new isOpen variable
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
