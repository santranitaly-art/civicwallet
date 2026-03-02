import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface BadgeProgressProps {
  currentHours: number;
  targetHours: number;
  nextBadgeName: string;
  className?: string;
}

export function BadgeProgress({
  currentHours,
  targetHours,
  nextBadgeName,
  className,
}: BadgeProgressProps) {
  const progress = Math.min((currentHours / targetHours) * 100, 100);
  const hoursRemaining = Math.max(targetHours - currentHours, 0);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-civic-gold" />
          <span className="text-sm font-semibold">Prossimo traguardo</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {currentHours.toFixed(1)}h / {targetHours}h
        </span>
      </div>

      <Progress
        value={progress}
        className="mb-3 h-2.5"
        indicatorClassName={cn(
          progress >= 100
            ? "bg-civic-green"
            : progress >= 66
              ? "bg-civic-gold"
              : "bg-civic-blue",
        )}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {progress >= 100 ? (
            <span className="font-medium text-civic-green">
              Traguardo raggiunto! Riscatta il badge.
            </span>
          ) : (
            <>
              Mancano{" "}
              <span className="font-medium text-foreground">
                {hoursRemaining.toFixed(1)} ore
              </span>{" "}
              per &quot;{nextBadgeName}&quot;
            </>
          )}
        </p>
        <span className="text-xs font-bold text-civic-blue">
          {progress.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
