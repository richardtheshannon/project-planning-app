"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar-provider"; // UPDATED IMPORT
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
} from "@/components/ui/sidebar"; // UPDATED IMPORT
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Home, Briefcase, Users, FileText, Settings, LogOut, Landmark } from "lucide-react";
import { LayoutPreferenceProvider, useLayoutPreference } from '@/lib/hooks/use-layout-preference'; 
import { cn } from "@/lib/utils";

function LayoutRenderer({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isRightHanded } = useLayoutPreference();
  const { setOpen } = useSidebar(); 

  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  return (
    <div className={cn("flex h-screen w-full", { "flex-row-reverse": isRightHanded })}>
      <Sidebar className="hidden md:flex">
        <SidebarItems onLinkClick={() => {}} />
      </Sidebar>

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
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

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

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
    { icon: Landmark, label: "Financials", href: "/dashboard/financials" },
    { icon: Users, label: "Team", href: "/dashboard/team" },
    { icon: FileText, label: "Documents", href: "/dashboard/documents" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const showText = isMobileSheet || open;

  return (
    <>
      <SidebarHeader>
        <div className="flex justify-center items-center p-2">
          <Link href="/dashboard" onClick={onLinkClick}>
            <Image
              src="/media/icon-96x96.png"
              alt="Company Logo"
              width={showText ? 48 : 32}
              height={showText ? 48 : 32}
              priority
              className="transition-all"
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard")}
                >
                  <Link 
                    href={item.href} 
                    className={cn("flex items-center gap-2 w-full", { "justify-end": isRightHanded })}
                    onClick={onLinkClick}
                  >
                    {isRightHanded ? (
                      <>
                        {showText && <span className="truncate">{item.label}</span>}
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                      </>
                    ) : (
                      <>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {showText && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
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
            className={cn("flex items-center gap-2 w-full", { "justify-end": isRightHanded })}
          >
            {isRightHanded ? (
              <>
                {showText && <span>Logout</span>}
                <LogOut className="h-4 w-4 flex-shrink-0" />
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {showText && <span>Logout</span>}
              </>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </>
  );
}

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
    <LayoutPreferenceProvider>
      <SidebarProvider defaultOpen={true}>
        <LayoutRenderer>{children}</LayoutRenderer>
      </SidebarProvider>
    </LayoutPreferenceProvider>
  );
}
