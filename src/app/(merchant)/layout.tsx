"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Percent,
  Shield,
  LogOut,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleGuard } from "@/components/auth/role-guard";
import { cn } from "@/lib/utils";

const merchantNav = [
  {
    href: "/merchant/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/merchant/scan",
    label: "Scansiona",
    icon: ScanLine,
  },
  {
    href: "/merchant/discounts",
    label: "Sconti",
    icon: Percent,
  },
];

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["MERCHANT"]}>
        <div className="flex min-h-screen flex-col bg-slate-50">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-civic-gold" />
                <span className="font-bold text-civic-blue">
                  CivicWallet
                </span>
                <span className="rounded-full bg-civic-green/10 px-2 py-0.5 text-xs font-medium text-civic-green">
                  Esercente
                </span>
              </div>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-6">
            {children}
          </main>

          {/* Bottom Nav (Mobile) */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/80 backdrop-blur-xl md:hidden">
            <div className="flex items-center justify-around py-2">
              {merchantNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                      isActive
                        ? "text-civic-blue"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span
                      className={cn(
                        "font-medium",
                        isActive && "font-semibold",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
