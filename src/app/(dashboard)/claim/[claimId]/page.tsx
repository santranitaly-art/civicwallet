"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { BadgeCard } from "@/components/badges/badge-card";
import { BadgeClaimButton } from "@/components/badges/badge-claim-button";
import { Skeleton } from "@/components/ui/skeleton";

interface ClaimDetail {
  id: string;
  tokenId: number;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  category: string;
  status: string;
  triggerReason: string;
  createdAt: string;
  expiresAt?: string;
}

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClaim() {
      try {
        const res = await fetch(`/api/badges/claims/${params.claimId}`);
        if (!res.ok) throw new Error("Failed to fetch claim");
        const data = await res.json();
        setClaim(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.claimId) {
      fetchClaim();
    }
  }, [params.claimId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Riscatto non trovato.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/claim")}
        >
          Torna alla lista
        </Button>
      </div>
    );
  }

  const triggerReasonLabels: Record<string, string> = {
    hours_milestone_15: "Raggiunto traguardo 15 ore",
    hours_milestone_50: "Raggiunto traguardo 50 ore",
    hours_milestone_200: "Raggiunto traguardo 200 ore",
    manual_admin: "Assegnato dall'amministratore",
    skill_certified: "Competenza certificata",
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Button>

      {/* Badge Preview */}
      <BadgeCard
        tokenId={claim.tokenId}
        name={claim.nameIt || claim.name}
        category={claim.category}
        earned={false}
      />

      {/* Claim Info */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-bold">
              {claim.nameIt || claim.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {claim.descriptionIt || claim.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <UIBadge variant="secondary">{claim.category}</UIBadge>
            <UIBadge variant="warning">Da riscattare</UIBadge>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Motivazione</span>
              <span className="font-medium">
                {triggerReasonLabels[claim.triggerReason] ||
                  claim.triggerReason}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium">
                {new Date(claim.createdAt).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {claim.expiresAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scadenza</span>
                <span className="font-medium">
                  {new Date(claim.expiresAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>
              Il badge sara coniato come Soulbound Token sulla blockchain
              Polygon.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Claim Button */}
      {claim.status === "PENDING" && (
        <BadgeClaimButton
          claimId={claim.id}
          badgeName={claim.nameIt || claim.name}
          onSuccess={() => {
            // Refresh after a delay to show the success state
            setTimeout(() => {
              router.push("/badges");
            }, 3000);
          }}
        />
      )}
    </div>
  );
}
