"use client";

import Link from "next/link";
import { Bell, Shield, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onMenuToggle?: () => void;
  notificationCount?: number;
  walletAddress?: string;
}

export function Header({
  title,
  onMenuToggle,
  notificationCount = 0,
  walletAddress,
}: HeaderProps) {
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-6 w-6 text-civic-gold" />
            <span className="font-bold text-civic-blue">CivicWallet</span>
          </div>
          {title && (
            <h1 className="hidden text-lg font-semibold md:block">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {truncatedAddress && (
            <div className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground sm:flex">
              <div className="h-2 w-2 rounded-full bg-civic-green" />
              {truncatedAddress}
            </div>
          )}

          <Link href="/dashboard" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white",
                    notificationCount > 9
                      ? "h-5 w-5"
                      : "h-4 w-4",
                  )}
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
