import { BadgeCard } from "@/components/badges/badge-card";
import { cn } from "@/lib/utils";
import type { BadgeWithClaim } from "@/types";

interface WalletViewProps {
  badges: BadgeWithClaim[];
  maxDisplay?: number;
  onBadgeClick?: (badge: BadgeWithClaim) => void;
  className?: string;
}

export function WalletView({
  badges,
  maxDisplay = 3,
  onBadgeClick,
  className,
}: WalletViewProps) {
  // Only show earned badges in the wallet stack
  const earnedBadges = badges
    .filter((b) => b.claimed)
    .slice(0, maxDisplay);

  if (earnedBadges.length === 0) {
    return (
      <div className={cn("rounded-2xl border-2 border-dashed border-muted p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          Il tuo wallet e vuoto. Riscatta i badge per vederli qui!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("wallet-stack", className)}>
      {earnedBadges.map((badge, index) => (
        <div
          key={badge.id}
          className="relative"
          style={{
            zIndex: earnedBadges.length - index,
          }}
        >
          <BadgeCard
            tokenId={badge.tokenId}
            name={badge.nameIt || badge.name}
            category={badge.category}
            earned={true}
            dateEarned={badge.mintedAt?.toString() || null}
            compact={index > 0}
            onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
