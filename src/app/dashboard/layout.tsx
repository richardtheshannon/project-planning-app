"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Briefcase, Users, FileText, Settings, LogOut } from "lucide-react";
// The .tsx extension has been removed from the import path below
import { LayoutPreferenceProvider, useLayoutPreference } from '@/lib/hooks/use-layout-preference'; 
import { cn } from "@/lib/utils";

// This new component renders the actual layout. It's a child of the provider,
// so it can safely call the useLayoutPreference hook.
function LayoutRenderer({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isRightHanded } = useLayoutPreference(); // This call is now safe

  return (
    <div className={cn("flex h-screen w-full", { "flex-row-reverse": isRightHanded })}>
      <Sidebar>
        <SidebarItems />
      </Sidebar>
      <div className="flex-1 flex flex-col min-w-0">
        <header className={cn("border-b px-4 py-3 flex items-center gap-4", { "flex-row-reverse": isRightHanded })}>
          <SidebarTrigger />
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

// This component has been updated to handle right-handed alignment more explicitly.
function SidebarItems() {
  const pathname = usePathname();
  const { open, setOpen, isMobile } = useSidebar();
  const { isRightHanded } = useLayoutPreference(); // Get the layout preference

  const handleNavigation = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
    { icon: Users, label: "Team", href: "/dashboard/team" },
    { icon: FileText, label: "Documents", href: "/dashboard/documents" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex justify-center">
          {open && (
            <Link href="/dashboard">
              <Image
                src="/media/icon-96x96.png"
                alt="Company Logo"
                width={48}
                height={48}
                priority
              />
            </Link>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  onClick={handleNavigation}
                >
                  {/* Conditionally render order and apply right-alignment */}
                  <Link href={item.href} className={cn("flex items-center gap-2 w-full", { "justify-end": isRightHanded })}>
                    {isRightHanded ? (
                      <>
                        {open && <span className="truncate">{item.label}</span>}
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                      </>
                    ) : (
                      <>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {open && <span className="truncate">{item.label}</span>}
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
          {/* Apply conditional rendering to the logout button */}
          <SidebarMenuButton onClick={() => signOut()} className={cn("flex items-center gap-2 w-full", { "justify-end": isRightHanded })}>
            {isRightHanded ? (
              <>
                {open && <span>Logout</span>}
                <LogOut className="h-4 w-4 flex-shrink-0" />
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {open && <span>Logout</span>}
              </>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </>
  );
}


// This is the main export for the layout file
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

  // We wrap the entire layout in the LayoutPreferenceProvider.
  // This makes the context available to all child components, including LayoutRenderer.
  return (
    <LayoutPreferenceProvider>
      <SidebarProvider>
        <LayoutRenderer>{children}</LayoutRenderer>
      </SidebarProvider>
    </LayoutPreferenceProvider>
  );
}
