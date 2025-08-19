"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Landmark, 
  ClipboardList,
  Bell,
  Palette,
  Lightbulb
} from "lucide-react";
import { LayoutPreferenceProvider, useLayoutPreference } from '@/lib/hooks/use-layout-preference'; 
import { cn } from "@/lib/utils";

// --- APPEARANCE SETTINGS CONTEXT (No changes) ---
type AppearanceSettings = {
  lightModeLogoUrl?: string | null;
  lightModeIconUrl?: string | null;
  darkModeLogoUrl?: string | null;
  darkModeIconUrl?: string | null;
  lightBackground?: string;
  lightForeground?: string;
  lightCard?: string;
  lightCardForeground?: string;
  lightPopover?: string;
  lightPopoverForeground?: string;
  lightPrimary?: string;
  lightPrimaryForeground?: string;
  lightSecondary?: string;
  lightSecondaryForeground?: string;
  lightMuted?: string;
  lightMutedForeground?: string;
  lightAccent?: string;
  lightAccentForeground?: string;
  lightDestructive?: string;
  lightDestructiveForeground?: string;
  lightBorder?: string;
  lightInput?: string;
  lightRing?: string;
  darkBackground?: string;
  darkForeground?: string;
  darkCard?: string;
  darkCardForeground?: string;
  darkPopover?: string;
  darkPopoverForeground?: string;
  darkPrimary?: string;
  darkPrimaryForeground?: string;
  darkSecondary?: string;
  darkSecondaryForeground?: string;
  darkMuted?: string;
  darkMutedForeground?: string;
  darkAccent?: string;
  darkAccentForeground?: string;
  darkDestructive?: string;
  darkDestructiveForeground?: string;
  darkBorder?: string;
  darkInput?: string;
  darkRing?: string;
};

interface AppearanceContextType {
  settings: AppearanceSettings | null;
  isLoading: boolean;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// --- PROVIDER COMPONENT (No changes) ---
function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppearanceSettings = async () => {
      try {
        const response = await fetch('/api/appearance');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error("Failed to fetch appearance settings.");
        }
      } catch (error) {
        console.error("Error fetching appearance settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppearanceSettings();
  }, []);

  return (
    <AppearanceContext.Provider value={{ settings, isLoading }}>
      {children}
    </AppearanceContext.Provider>
  );
}

// --- CUSTOM HOOK (No changes) ---
export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};

// --- Helper function to convert HEX to HSL (No changes) ---
function hexToHslString(hex: string | null | undefined): string {
    if (!hex) return '0 0% 0%';
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}

// --- DYNAMIC STYLES COMPONENT (No changes) ---
function DynamicGlobalStyles() {
    const { settings, isLoading } = useAppearance();

    if (isLoading || !settings) {
        return null;
    }

    const styles = `
    :root {
        --background: ${hexToHslString(settings.lightBackground)};
        --foreground: ${hexToHslString(settings.lightForeground)};
        --card: ${hexToHslString(settings.lightCard)};
        --card-foreground: ${hexToHslString(settings.lightCardForeground)};
        --popover: ${hexToHslString(settings.lightPopover)};
        --popover-foreground: ${hexToHslString(settings.lightPopoverForeground)};
        --primary: ${hexToHslString(settings.lightPrimary)};
        --primary-foreground: ${hexToHslString(settings.lightPrimaryForeground)};
        --secondary: ${hexToHslString(settings.lightSecondary)};
        --secondary-foreground: ${hexToHslString(settings.lightSecondaryForeground)};
        --muted: ${hexToHslString(settings.lightMuted)};
        --muted-foreground: ${hexToHslString(settings.lightMutedForeground)};
        --accent: ${hexToHslString(settings.lightAccent)};
        --accent-foreground: ${hexToHslString(settings.lightAccentForeground)};
        --destructive: ${hexToHslString(settings.lightDestructive)};
        --destructive-foreground: ${hexToHslString(settings.lightDestructiveForeground)};
        --border: ${hexToHslString(settings.lightBorder)};
        --input: ${hexToHslString(settings.lightInput)};
        --ring: ${hexToHslString(settings.lightRing)};
        --radius: 0.5rem;
    }

    .dark {
        --background: ${hexToHslString(settings.darkBackground)};
        --foreground: ${hexToHslString(settings.darkForeground)};
        --card: ${hexToHslString(settings.darkCard)};
        --card-foreground: ${hexToHslString(settings.darkCardForeground)};
        --popover: ${hexToHslString(settings.darkPopover)};
        --popover-foreground: ${hexToHslString(settings.darkPopoverForeground)};
        --primary: ${hexToHslString(settings.darkPrimary)};
        --primary-foreground: ${hexToHslString(settings.darkPrimaryForeground)};
        --secondary: ${hexToHslString(settings.darkSecondary)};
        --secondary-foreground: ${hexToHslString(settings.darkSecondaryForeground)};
        --muted: ${hexToHslString(settings.darkMuted)};
        --muted-foreground: ${hexToHslString(settings.darkMutedForeground)};
        --accent: ${hexToHslString(settings.darkAccent)};
        --accent-foreground: ${hexToHslString(settings.darkAccentForeground)};
        --destructive: ${hexToHslString(settings.darkDestructive)};
        --destructive-foreground: ${hexToHslString(settings.darkDestructiveForeground)};
        --border: ${hexToHslString(settings.darkBorder)};
        --input: ${hexToHslString(settings.darkInput)};
        --ring: ${hexToHslString(settings.darkRing)};
    }
    `;

    return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

// --- LAYOUT RENDERER (No changes) ---
function LayoutRenderer({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isRightHanded } = useLayoutPreference();
  const { setOpen } = useSidebar(); 
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  return (
    <>
      <DynamicGlobalStyles />
      <div className={cn("flex min-h-screen w-full bg-background text-foreground", { "flex-row-reverse": isRightHanded })}>
        <div className="hidden md:sticky md:top-0 md:h-screen md:flex">
          <Sidebar>
            <SidebarItems onLinkClick={() => {}} />
          </Sidebar>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className={cn("border-b px-4 py-3 flex items-center gap-4", { "flex-row-reverse": isRightHanded })}>
            <div className="md:hidden">
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <SidebarTrigger />
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] p-0">
                  <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    A list of links to navigate through the application sections.
                  </SheetDescription>
                  <Sidebar isMobileSheet={true}>
                    <SidebarItems isMobileSheet={true} onLinkClick={() => setIsMobileSheetOpen(false)} />
                  </Sidebar>
                </SheetContent>
              </Sheet>
            </div>
            
            <SidebarTrigger 
              className="hidden md:flex" 
              onClick={() => setOpen((prev: boolean) => !prev)}
            />

            <h1 className="text-xl font-semibold">
              {session?.user?.name || session?.user?.email}
            </h1>
          </header>
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

// --- SIDEBAR ITEMS COMPONENT (UPDATED WITH SETTINGS SUB-ITEMS) ---
function SidebarItems({ 
  isMobileSheet = false,
  onLinkClick,
}: { 
  isMobileSheet?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { isRightHanded } = useLayoutPreference();
  const { theme } = useTheme();
  const { settings, isLoading } = useAppearance();

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
    { icon: ClipboardList, label: "Operations", href: "/dashboard/operations" },
    { 
      icon: Landmark, 
      label: "Financials", 
      href: "/dashboard/financials",
      subItems: [
        { label: "Overview", href: "/dashboard/financials" },
        { label: "Income", href: "/dashboard/financials/income" },
        { label: "Expenses", href: "/dashboard/financials/expenses" },
        { label: "Reports", href: "/dashboard/financials/reports" },
        { label: "Documents", href: "/dashboard/financials/documents" },
      ] 
    },
    { icon: Users, label: "Team", href: "/dashboard/team" },
    { icon: FileText, label: "Documents", href: "/dashboard/documents" },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/dashboard/settings",
      subItems: [
        { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
        { label: "Branding", href: "/dashboard/settings/branding", icon: Palette },
        { label: "Feature Requests", href: "/dashboard/settings/feature-requests", icon: Lightbulb },
      ]
    },
  ];

  const showText = isMobileSheet || open;

  const originalIconUrl = theme === 'dark' 
    ? settings?.darkModeIconUrl 
    : settings?.lightModeIconUrl;

  const displayIconUrl = originalIconUrl 
    ? `/logos/${originalIconUrl.split('/').pop()}`
    : null;

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <div className="flex justify-center items-center p-2 h-[64px]">
          <Link href="/dashboard" onClick={onLinkClick}>
            {isLoading ? (
              <div style={{ width: showText ? 48 : 32, height: showText ? 48 : 32 }} className="bg-muted rounded animate-pulse" />
            ) : (
              displayIconUrl && (
                <Image
                  src={displayIconUrl}
                  alt="Company Icon"
                  width={showText ? 48 : 32}
                  height={showText ? 48 : 32}
                  priority
                  className="transition-all"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )
            )}
          </Link>
        </div>
      </SidebarHeader>
      {/* UPDATE: Added overflow-x-hidden to prevent scrollbar on collapse */}
      <SidebarContent className="flex-grow overflow-x-hidden">
        <SidebarGroup className="my-auto">
          <SidebarGroupContent>
            <div className="w-full space-y-1">
              {menuItems.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;

                // --- RENDER LOGIC FOR COLLAPSED SIDEBAR ---
                if (!showText) {
                  if (hasSubItems) {
                    return (
                      <Popover key={item.label}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <div className={cn(
                                "flex items-center justify-center gap-2 w-full text-sm font-medium rounded-md p-2 cursor-pointer",
                                { "bg-accent text-accent-foreground": pathname.startsWith(item.href) },
                                "hover:bg-accent hover:text-accent-foreground"
                              )}>
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                              </div>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent side={isRightHanded ? "left" : "right"}>
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                        <PopoverContent side={isRightHanded ? "left" : "right"} align="start" className="w-[200px] p-2">
                           <div className="space-y-1">
                              {item.subItems?.map((subItem) => (
                                <SidebarMenuButton
                                  key={subItem.href}
                                  asChild
                                  isActive={pathname === subItem.href}
                                  className="w-full justify-start h-8"
                                >
                                  <Link href={subItem.href} onClick={onLinkClick}>
                                    {subItem.label}
                                  </Link>
                                </SidebarMenuButton>
                              ))}
                           </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={onLinkClick}
                          className={cn(
                            "flex items-center justify-center gap-2 w-full text-sm font-medium rounded-md p-2",
                            { "bg-accent text-accent-foreground": pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard") },
                            "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side={isRightHanded ? "left" : "right"}>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                // --- RENDER LOGIC FOR EXPANDED SIDEBAR ---
                return hasSubItems ? (
                  <Accordion type="single" collapsible className="w-full" key={item.label}>
                    <AccordionItem value={item.label} className="border-none">
                      <AccordionTrigger 
                        className={cn(
                          "flex items-center gap-2 w-full text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground p-2 hover:no-underline",
                          { "bg-accent text-accent-foreground": pathname.startsWith(item.href) },
                          { "justify-between": !isRightHanded },
                          { "flex-row-reverse": isRightHanded }
                        )}
                      >
                         <div className={cn("flex items-center gap-2", { "flex-row-reverse": isRightHanded })}>
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 pr-2 pb-0 pt-1">
                        <ul className="space-y-1">
                          {item.subItems.map((subItem) => (
                             <li key={subItem.href}>
                               <SidebarMenuButton
                                 asChild
                                 isActive={pathname === subItem.href}
                                 className="w-full justify-start h-8"
                               >
                                 <Link 
                                   href={subItem.href} 
                                   className={cn("flex items-center gap-2 w-full text-sm", { "justify-end": isRightHanded })}
                                   onClick={onLinkClick}
                                 >
                                   <span className="truncate">{subItem.label}</span>
                                 </Link>
                               </SidebarMenuButton>
                             </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center justify-between gap-2 w-full text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground p-2",
                      { "bg-accent text-accent-foreground": pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard") },
                      { "flex-row-reverse": isRightHanded }
                    )}
                  >
                    <div className={cn("flex items-center gap-2", { "flex-row-reverse": isRightHanded })}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => {
              signOut();
              if (onLinkClick) onLinkClick();
            }} 
            className={cn("flex w-full items-center gap-2", { 
              "justify-center": !showText,
              "justify-start": showText && !isRightHanded,
              "justify-end": showText && isRightHanded,
              "flex-row-reverse": showText && isRightHanded
            })}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {showText && <span>Logout</span>}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </div>
  );
}

// --- DEFAULT EXPORT (UPDATED WITH TOOLTIP PROVIDER) ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <AppearanceProvider>
      <LayoutPreferenceProvider>
        <SidebarProvider defaultOpen={true}>
          {/* UPDATE: TooltipProvider needs to wrap the layout for tooltips to work */}
          <TooltipProvider>
            <LayoutRenderer>{children}</LayoutRenderer>
          </TooltipProvider>
        </SidebarProvider>
      </LayoutPreferenceProvider>
    </AppearanceProvider>
  );
}