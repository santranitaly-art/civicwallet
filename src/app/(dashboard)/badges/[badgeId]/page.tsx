"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Copy,
  Linkedin,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { BadgeCard } from "@/components/badges/badge-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BadgeWithClaim } from "@/types";

export default function BadgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [badge, setBadge] = useState<BadgeWithClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    async function fetchBadge() {
      try {
        const res = await fetch(`/api/badges/${params.badgeId}`);
        if (!res.ok) throw new Error("Failed to fetch badge");
        const data = await res.json();
        setBadge(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.badgeId) {
      fetchBadge();
    }
  }, [params.badgeId]);

  async function handleCopyLink() {
    const url = `${window.location.origin}/badges/${params.badgeId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handleLinkedInShare() {
    const url = `${window.location.origin}/badges/${params.badgeId}`;
    const text = `Ho ottenuto il badge "${badge?.nameIt || badge?.name}" su CivicWallet per il mio impegno nel volontariato!`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      "_blank",
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Badge non trovato.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/badges")}
        >
          Torna alla galleria
        </Button>
      </div>
    );
  }

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

      {/* Large Badge Card */}
      <BadgeCard
        tokenId={badge.tokenId}
        name={badge.nameIt || badge.name}
        category={badge.category}
        earned={badge.claimed}
        dateEarned={badge.mintedAt?.toString() || null}
      />

      {/* Badge Details */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-bold">
              {badge.nameIt || badge.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {badge.descriptionIt || badge.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <UIBadge variant="secondary">{badge.category}</UIBadge>
            {badge.claimed && (
              <UIBadge variant="success">Ottenuto</UIBadge>
            )}
            {!badge.claimed && badge.claimStatus === "PENDING" && (
              <UIBadge variant="warning">Da riscattare</UIBadge>
            )}
            {badge.hoursRequired && (
              <UIBadge variant="outline">
                {badge.hoursRequired}h richieste
              </UIBadge>
            )}
          </div>

          {/* Transaction Details */}
          {badge.transactionHash && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-civic-green" />
                Verificato on-chain
              </div>
              <a
                href={`https://polygonscan.com/tx/${badge.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-civic-blue hover:underline"
              >
                {badge.transactionHash.slice(0, 10)}...
                {badge.transactionHash.slice(-8)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Section */}
      {badge.claimed && (
        <div className="space-y-3">
          <Button
            variant="civic-outline"
            rounded="full"
            className="w-full"
            onClick={() => setShowShare(!showShare)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Condividi
          </Button>

          {showShare && (
            <Card>
              <CardContent className="flex gap-3 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  rounded="full"
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-civic-green" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copia link
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  rounded="full"
                  onClick={handleLinkedInShare}
                  className="flex-1"
                >
                  <Linkedin className="mr-1.5 h-3.5 w-3.5" />
                  LinkedIn
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
