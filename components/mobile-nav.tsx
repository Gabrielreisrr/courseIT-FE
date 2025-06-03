"use client";

import { Home, BookOpen, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: "Courses",
      href: "/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  // Add admin items if user is admin
  const adminItems = user?.role === "ADMIN" 
    ? [
        {
          label: "Manage Users",
          href: "/admin/users",
        },
        {
          label: "Manage Courses",
          href: "/admin/courses",
        },
      ]
    : [];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b">
        <Logo />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Logo />
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                <div className="flex-1 px-4 py-6 overflow-y-auto">
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}

                    {user?.role === "ADMIN" && (
                      <>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2 px-3">
                          Admin
                        </div>
                        {adminItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                              pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent"
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </>
                    )}
                  </nav>
                </div>

                <div className="p-4 border-t">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={logout}
                      >
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      {user && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t flex items-center justify-around p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-md transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}