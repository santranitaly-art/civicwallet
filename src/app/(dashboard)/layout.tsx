"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useActiveAccount } from "thirdweb/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const account = useActiveAccount();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <Header
            walletAddress={account?.address}
            onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
