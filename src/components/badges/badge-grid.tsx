import { BadgeCard } from "./badge-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Award } from "lucide-react";
import type { BadgeWithClaim } from "@/types";

interface BadgeGridProps {
  badges: BadgeWithClaim[];
  onBadgeClick?: (badge: BadgeWithClaim) => void;
  showEmpty?: boolean;
}

export function BadgeGrid({
  badges,
  onBadgeClick,
  showEmpty = true,
}: BadgeGridProps) {
  if (badges.length === 0 && showEmpty) {
    return (
      <EmptyState
        icon={Award}
        title="Nessun badge disponibile"
        description="I badge appariranno qui quando saranno disponibili per il tuo profilo."
      />
    );
  }

  // Sort: earned first, then by tokenId
  const sortedBadges = [...badges].sort((a, b) => {
    if (a.claimed !== b.claimed) return a.claimed ? -1 : 1;
    return a.tokenId - b.tokenId;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          tokenId={badge.tokenId}
          name={badge.nameIt || badge.name}
          category={badge.category}
          earned={badge.claimed}
          dateEarned={badge.mintedAt?.toString() || null}
          onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
        />
      ))}
    </div>
  );
}
