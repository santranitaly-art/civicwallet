import {
  Award,
  Crown,
  Heart,
  Truck,
  Users,
  Shield,
  BookOpen,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGE_METADATA } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Award,
  Crown,
  Heart,
  Truck,
  Users,
  Shield,
  BookOpen,
};

interface BadgeCardProps {
  tokenId: number;
  name: string;
  category: string;
  earned: boolean;
  dateEarned?: string | null;
  associationName?: string | null;
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export function BadgeCard({
  tokenId,
  name,
  category,
  earned,
  dateEarned,
  associationName,
  className,
  compact = false,
  onClick,
}: BadgeCardProps) {
  const meta = BADGE_METADATA[tokenId as keyof typeof BADGE_METADATA];
  const gradient = meta?.gradient || "from-slate-600 to-slate-400";
  const IconComponent = meta?.icon ? iconMap[meta.icon] || Award : Award;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-300",
        earned
          ? "badge-card-shadow cursor-pointer hover:-translate-y-1 hover:shadow-xl"
          : "cursor-default opacity-60 grayscale",
        compact ? "p-4" : "p-6",
        className,
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          earned ? gradient : "from-gray-400 to-gray-300",
        )}
      />

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {!compact && (
              <span className="mb-1 inline-block text-xs font-medium uppercase tracking-wider text-white/70">
                {category}
              </span>
            )}
            <h3
              className={cn(
                "font-bold text-white",
                compact ? "text-sm" : "text-lg",
              )}
            >
              {name}
            </h3>
          </div>
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-white/20",
              compact ? "h-10 w-10" : "h-12 w-12",
            )}
          >
            {earned ? (
              <IconComponent
                className={cn(
                  "text-white",
                  compact ? "h-5 w-5" : "h-6 w-6",
                )}
              />
            ) : (
              <Lock
                className={cn(
                  "text-white/60",
                  compact ? "h-5 w-5" : "h-6 w-6",
                )}
              />
            )}
          </div>
        </div>

        {!compact && (
          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              {dateEarned && (
                <p className="text-xs text-white/80">
                  Ottenuto il{" "}
                  {new Date(dateEarned).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {associationName && (
                <p className="text-xs text-white/60">{associationName}</p>
              )}
              {!earned && (
                <p className="text-xs text-white/60">Non ancora ottenuto</p>
              )}
            </div>

            {/* CivicWallet Watermark */}
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Shield className="h-3 w-3" />
              <span>CW</span>
            </div>
          </div>
        )}
      </div>

      {/* Shine Effect on Hover (earned only) */}
      {earned && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -left-full top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_ease-in-out]" />
        </div>
      )}
    </div>
  );
}
