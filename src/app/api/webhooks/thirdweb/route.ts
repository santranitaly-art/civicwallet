import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMintStatus } from "@/services/minting.service";
import { errorResponse, ValidationError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/webhooks/thirdweb
 *
 * Handles thirdweb Engine transaction status callbacks.
 * When a mint transaction is confirmed or fails on-chain,
 * thirdweb sends a webhook notification here.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by source IP
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`webhook:thirdweb:${ip}`, 60, 60_000)) {
      return Response.json(
        { error: "Troppe richieste", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    // Verify the thirdweb webhook secret
    const webhookSecret = process.env.THIRDWEB_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get("authorization");
      const providedSecret = request.headers.get("x-webhook-secret")
        ?? authHeader?.replace("Bearer ", "");

      if (providedSecret !== webhookSecret) {
        return Response.json(
          { error: "Webhook secret non valido", code: "INVALID_SECRET" },
          { status: 401 },
        );
      }
    }

    const body = await request.json();

    // Thirdweb Engine webhook payload structure
    const {
      type,
      transactionHash,
      status,
      queueId,
      errorMessage,
      toAddress,
    } = body;

    // Log the incoming webhook for debugging
    console.log(
      `[thirdweb-webhook] type=${type} status=${status} txHash=${transactionHash ?? "N/A"} queueId=${queueId ?? "N/A"}`,
    );

    // We only care about transaction-related events
    if (type !== "sent_transaction" && type !== "mined_transaction" && type !== "errored_transaction") {
      // Acknowledge but ignore non-transaction events
      return Response.json({ success: true, message: "Event type ignored" });
    }

    // Find the MintedBadge record that matches this transaction.
    // We look up by transactionHash first, then by wallet address + pending status.
    let mintedBadge = null;

    if (transactionHash) {
      mintedBadge = await prisma.mintedBadge.findFirst({
        where: { transactionHash },
      });
    }

    // If we can't find by txHash (e.g., initial submission), try queueId stored in metadata
    // or match by wallet address + SUBMITTED status
    if (!mintedBadge && toAddress) {
      mintedBadge = await prisma.mintedBadge.findFirst({
        where: {
          walletAddress: {
            equals: toAddress,
            mode: "insensitive",
          },
          mintStatus: "SUBMITTED",
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!mintedBadge) {
      // We cannot match this callback to a mint record. Log and acknowledge.
      console.warn(
        `[thirdweb-webhook] Could not match transaction to MintedBadge: txHash=${transactionHash}, toAddress=${toAddress}`,
      );
      return Response.json({
        success: true,
        message: "No matching MintedBadge found",
      });
    }

    // Map thirdweb status to our MintStatus
    if (type === "mined_transaction" && status === "mined") {
      await updateMintStatus(
        mintedBadge.id,
        transactionHash ?? mintedBadge.transactionHash,
        "CONFIRMED",
      );
    } else if (type === "errored_transaction" || status === "errored") {
      await updateMintStatus(
        mintedBadge.id,
        transactionHash ?? mintedBadge.transactionHash,
        "FAILED",
        errorMessage ?? "Transaction failed on-chain",
      );
    } else if (type === "sent_transaction") {
      // Transaction was sent but not yet mined — update hash if available
      if (transactionHash && !mintedBadge.transactionHash) {
        await updateMintStatus(
          mintedBadge.id,
          transactionHash,
          "SUBMITTED",
        );
      }
    }

    return Response.json({
      success: true,
      mintedBadgeId: mintedBadge.id,
      newStatus: type === "mined_transaction" ? "CONFIRMED"
        : type === "errored_transaction" ? "FAILED"
        : "SUBMITTED",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
