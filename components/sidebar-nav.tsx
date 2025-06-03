"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  User, 
  UserCog, 
  BookMarked,
  FileText,
  LogOut,
  ChevronRight,
  Users,
  LayoutDashboard,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Courses",
      href: "/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  // Admin specific items
  const adminItems = isAdmin
    ? [
        {
          title: "Users Management",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Courses Management",
          href: "/admin/courses",
          icon: <BookMarked className="h-5 w-5" />,
        },
        {
          title: "Modules Management",
          href: "/admin/modules",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "Lessons Management",
          href: "/admin/lessons",
          icon: <FileText className="h-5 w-5" />,
        },
      ]
    : [];

  return (
    <div className="hidden lg:flex flex-col h-screen w-64 border-r bg-card">
      <div className="p-4 flex justify-between items-center">
        <Logo />
        <ThemeToggle />
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <div className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </h2>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="ml-3 flex-1">{item.title}</span>
                  {pathname === item.href && (
                    <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <div className="px-3 mb-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administration
                </h2>
              </div>
              <nav className="space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3 flex-1">{item.title}</span>
                    {pathname === item.href && (
                      <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}