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

// This component contains the logic for the sidebar's contents
function SidebarItems() {
  const pathname = usePathname();
  // Get the sidebar's state (open/closed, mobile/desktop)
  const { open, setOpen, isMobile } = useSidebar();

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
          {/* Conditionally render the logo based on the sidebar state */}
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
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {/* Conditionally render the label */}
                    {open && <span className="truncate">{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => signOut()} className="flex items-center gap-2">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {/* Conditionally render the label */}
            {open && <span>Logout</span>}
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
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarItems />
        </Sidebar>
        {/* Add min-w-0 to the main content area to prevent horizontal overflow */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b px-4 py-3 flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">
              {session.user?.name || session.user?.email}
            </h1>
          </header>
          <main className="flex-1 overflow-auto">
            {/* The p-6 was moved here to ensure the whole area scrolls */}
            <div className="p-6">
                {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
