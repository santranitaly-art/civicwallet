"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Award, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/badges",
    label: "Badge",
    icon: Award,
  },
  {
    href: "/claim",
    label: "Riscatta",
    icon: Gift,
  },
  {
    href: "/profile",
    label: "Profilo",
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
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
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive && "fill-civic-blue/10",
                )}
              />
              <span className={cn("font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-civic-blue" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
