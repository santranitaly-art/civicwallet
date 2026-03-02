"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ArrowRight,
  Bell,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletView } from "@/components/wallet/wallet-view";
import { BadgeProgress } from "@/components/badges/badge-progress";
import { formatHours } from "@/lib/utils";
import type { VolunteerProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingClaims, setPendingClaims] = useState(0);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/volunteers/me");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.data);

        // Count pending claims
        const pending = data.data?.badges?.filter(
          (b: { claimStatus?: string; claimed?: boolean }) =>
            b.claimStatus === "PENDING" && !b.claimed,
        ).length || 0;
        setPendingClaims(pending);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Impossibile caricare il profilo. Riprova.
        </p>
      </div>
    );
  }

  const earnedBadges = profile.badges.filter((b) => b.claimed);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Ciao, {profile.displayName || "Volontario"}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Il tuo Libretto Formativo e ore certificate
        </p>
      </div>

      {/* Pending Claims Notification */}
      {pendingClaims > 0 && (
        <Link href="/claim">
          <div className="flex items-center gap-3 rounded-xl bg-civic-gold/10 border border-civic-gold/20 p-4 transition-colors hover:bg-civic-gold/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-civic-gold/20">
              <Bell className="h-5 w-5 text-civic-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-civic-blue">
                Hai {pendingClaims} badge da riscattare!
              </p>
              <p className="text-xs text-muted-foreground">
                Tocca per visualizzare e riscattare i tuoi badge
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-civic-gold" />
          </div>
        </Link>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-blue/10">
              <Clock className="h-5 w-5 text-civic-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ore totali</p>
              <p className="text-xl font-bold">
                {formatHours(profile.totalHours)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-green/10">
              <Calendar className="h-5 w-5 text-civic-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turni</p>
              <p className="text-xl font-bold">{profile.totalShifts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Progress */}
      {profile.nextMilestone && (
        <BadgeProgress
          currentHours={profile.totalHours}
          targetHours={profile.nextMilestone.hoursRequired}
          nextBadgeName={profile.nextMilestone.name}
        />
      )}

      {/* Wallet Badge Stack */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Certificazioni e Titoli (SBT)</CardTitle>
          <div className="flex items-center gap-2">
            <UIBadge variant="secondary">
              {earnedBadges.length} ottenuti
            </UIBadge>
            <Link href="/badges">
              <Button variant="ghost" size="sm">
                Vedi tutti
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <WalletView
            badges={profile.badges}
            onBadgeClick={(badge) => router.push(`/badges/${badge.id}`)}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="#export">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-blue/10">
                <FileText className="h-5 w-5 text-civic-blue" />
              </div>
              <span className="text-sm font-medium">Esporta CV (D.2025)</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/history">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-green/10">
                <Clock className="h-5 w-5 text-civic-green" />
              </div>
              <span className="text-sm font-medium">Storico Ore</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Association Info */}
      {profile.associationName && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Associazione</p>
            <p className="text-sm font-medium">{profile.associationName}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
