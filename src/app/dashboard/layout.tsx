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
  useSidebar, // Step 1: Import the useSidebar hook
} from "@/components/ui/sidebar";
import { Home, Briefcase, Users, FileText, Settings, LogOut } from "lucide-react";

// Step 2: Create a new component for the sidebar's contents
function SidebarItems() {
  const pathname = usePathname();
  // This hook provides access to the sidebar's state
  const { setOpen, isMobile } = useSidebar();

  // This function will be called when a navigation item is clicked
  const handleNavigation = () => {
    // If the screen is mobile, close the sidebar
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
          <Link href="/dashboard">
            <Image
              src="/media/icon-96x96.png"
              alt="Company Logo"
              width={48}
              height={48}
              priority
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
                  isActive={pathname === item.href}
                  onClick={handleNavigation} // Step 3: Add the click handler
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
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
  const pathname = usePathname();

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
          {/* Step 4: Render the new component */}
          <SidebarItems />
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="border-b px-4 py-3 flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">
              {session.user?.name || session.user?.email}
            </h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
