"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  Store,
  Award,
  Webhook,
  BarChart3,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNav = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/volunteers",
    label: "Volontari",
    icon: Users,
  },
  {
    href: "/admin/associations",
    label: "Associazioni",
    icon: Building,
  },
  {
    href: "/admin/merchants",
    label: "Esercenti",
    icon: Store,
  },
  {
    href: "/admin/badges",
    label: "Badge",
    icon: Award,
  },
  {
    href: "/admin/webhooks",
    label: "Webhook",
    icon: Webhook,
  },
  {
    href: "/admin/analytics",
    label: "Analisi",
    icon: BarChart3,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["PLATFORM_ADMIN", "ETS_ADMIN"]}>
        <div className="flex min-h-screen bg-slate-50">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-col border-r bg-white md:flex">
            <div className="flex h-16 items-center gap-2 border-b px-4">
              <Shield className="h-7 w-7 text-civic-gold" />
              <div>
                <span className="text-lg font-bold text-civic-blue">
                  CivicWallet
                </span>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Amministrazione
                </p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
              {adminNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-civic-blue/10 text-civic-blue"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-4">
              <p className="text-xs text-muted-foreground">
                CivicWallet Admin v0.1.0
              </p>
            </div>
          </aside>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <aside
                className="h-full w-64 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-16 items-center justify-between border-b px-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-civic-gold" />
                    <span className="font-bold text-civic-blue">Admin</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="space-y-1 px-2 py-4">
                  {adminNav.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-civic-blue/10 text-civic-blue"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Top Header */}
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/80 px-4 backdrop-blur-xl md:px-6">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">
                {adminNav.find(
                  (item) =>
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`),
                )?.label || "Amministrazione"}
              </h1>
            </header>

            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
