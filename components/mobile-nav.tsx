"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const studentNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "My Courses",
    href: "/courses",
    icon: BookOpen,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
        <Link href="/" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-bold">CourseIT</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-16 items-center border-b">
              <Link href="/" className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <span className="font-bold">CourseIT</span>
              </Link>
            </div>
            <nav className="grid gap-2 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 text-sm transition-colors hover:text-primary",
                      pathname === item.href
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t bg-background lg:hidden">
        <nav className="mx-auto flex h-full max-w-md items-center justify-around px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 text-xs transition-colors hover:text-primary",
                  isActive
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
