"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount, useDisconnect } from "thirdweb/react";
import {
  User,
  Mail,
  Building,
  Wallet,
  LogOut,
  Copy,
  CheckCircle2,
  ExternalLink,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress, formatHours } from "@/lib/utils";
import type { VolunteerProfile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/volunteers/me");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  async function handleCopyAddress() {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handleLogout() {
    disconnect(
      // @ts-expect-error - thirdweb types may vary
      { account },
    );
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Il tuo profilo</h1>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-civic-blue/10">
              <User className="h-10 w-10 text-civic-blue" />
            </div>
            <h2 className="mt-3 text-lg font-bold">
              {profile?.displayName || "Volontario"}
            </h2>
            {profile?.email && (
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            )}
          </div>

          {/* Info Grid */}
          <div className="space-y-3">
            {profile?.displayName && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium truncate">
                    {profile.displayName}
                  </p>
                </div>
              </div>
            )}

            {profile?.email && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
            )}

            {profile?.associationName && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Associazione</p>
                  <p className="text-sm font-medium truncate">
                    {profile.associationName}
                  </p>
                </div>
              </div>
            )}

            {account?.address && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Indirizzo wallet
                  </p>
                  <p className="font-mono text-sm font-medium">
                    {truncateAddress(account.address)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-civic-green" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <a
                    href={`https://polygonscan.com/address/${account.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Statistiche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex justify-center">
                <Clock className="h-5 w-5 text-civic-blue" />
              </div>
              <p className="mt-1 text-lg font-bold">
                {formatHours(profile?.totalHours || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Ore totali</p>
            </div>
            <div>
              <div className="flex justify-center">
                <Award className="h-5 w-5 text-civic-gold" />
              </div>
              <p className="mt-1 text-lg font-bold">
                {profile?.badges.filter((b) => b.claimed).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Badge</p>
            </div>
            <div>
              <div className="flex justify-center">
                <Building className="h-5 w-5 text-civic-green" />
              </div>
              <p className="mt-1 text-lg font-bold">
                {profile?.totalShifts || 0}
              </p>
              <p className="text-xs text-muted-foreground">Turni</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        rounded="full"
        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Esci
      </Button>
    </div>
  );
}
