"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { MobileNav } from "@/components/mobile-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MobileNav />
      <div className="flex flex-1">
        <SidebarNav />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
