export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getPlatformStats,
  getMintingStats,
  getWebhookStats,
} from "@/services/analytics.service";
import { errorResponse } from "@/lib/errors";

/**
 * GET /api/admin/analytics
 *
 * Platform-wide analytics for the admin dashboard.
 * Requires PLATFORM_ADMIN role.
 *
 * Returns:
 * - Total volunteers, badges minted, hours logged
 * - Total associations and merchants
 * - Badges per category breakdown
 * - Recent mints
 * - Minting pipeline health
 * - Webhook processing health
 *
 * Query params:
 * - webhookDays (default: 7) - Time window for webhook stats
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const webhookDays = Math.min(
      90,
      Math.max(1, Number(searchParams.get("webhookDays") ?? "7")),
    );

    // Run all analytics queries in parallel for speed
    const [platformStats, mintingStats, webhookStats] = await Promise.all([
      getPlatformStats(),
      getMintingStats(),
      getWebhookStats(webhookDays),
    ]);

    return Response.json({
      data: {
        platform: platformStats,
        minting: mintingStats,
        webhooks: webhookStats,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
