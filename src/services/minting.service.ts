import { prepareContractCall, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { prisma } from "@/lib/prisma";
import { getCivicBadgeContract, getClient } from "@/lib/thirdweb";
import { NotFoundError, AppError } from "@/lib/errors";
import { createNotification } from "./notification.service";

// The server-side admin wallet used to submit mint transactions.
// Must hold the MINTER_ROLE on the CivicBadge contract.
function getMinterAccount() {
  const privateKey = process.env.MINTER_PRIVATE_KEY;
  if (!privateKey) {
    throw new AppError(
      "MINTER_PRIVATE_KEY is not configured",
      500,
      "MINTER_CONFIG_ERROR",
    );
  }
  return privateKeyToAccount({ client: getClient(), privateKey });
}

// ---------------------------------------------------------------------------
// mintBadgeOnChain
// ---------------------------------------------------------------------------

/**
 * Execute the on-chain minting of a Soulbound Token for a given MintedBadge
 * record.
 *
 * Flow:
 *  1. Load the MintedBadge + volunteer + user data.
 *  2. Prepare the contract call (`mint(address to, uint256 id, uint256 amount, bytes data)`).
 *  3. Submit the transaction via the minter wallet.
 *  4. Update DB records with the transaction hash and status.
 *  5. Notify the volunteer upon confirmation.
 *
 * This function is meant to be called from an API route or background job.
 * It handles its own error-recovery: if the tx fails, the MintedBadge is
 * marked FAILED with the error message, and the error is re-thrown.
 */
export async function mintBadgeOnChain(mintedBadgeId: string): Promise<{
  transactionHash: string;
  mintedBadgeId: string;
}> {
  const mintedBadge = await prisma.mintedBadge.findUnique({
    where: { id: mintedBadgeId },
    include: {
      volunteer: { include: { user: true } },
      badgeType: true,
    },
  });

  if (!mintedBadge) {
    throw new NotFoundError(`MintedBadge ${mintedBadgeId} non trovato`);
  }

  if (mintedBadge.mintStatus === "CONFIRMED") {
    // Already minted — idempotent return
    return {
      transactionHash: mintedBadge.transactionHash!,
      mintedBadgeId: mintedBadge.id,
    };
  }

  if (mintedBadge.mintStatus !== "PENDING" && mintedBadge.mintStatus !== "FAILED") {
    throw new AppError(
      `MintedBadge ${mintedBadgeId} è in stato ${mintedBadge.mintStatus} — impossibile procedere`,
      409,
      "MINT_STATUS_CONFLICT",
    );
  }

  // Mark as SUBMITTED before sending the transaction
  await prisma.mintedBadge.update({
    where: { id: mintedBadgeId },
    data: { mintStatus: "SUBMITTED" },
  });

  try {
    const minterAccount = getMinterAccount();

    // Prepare the ERC-1155 `mint` call:
    //   mint(address to, uint256 id, uint256 amount, bytes data)
    // amount is always 1 for SBTs. data is empty.
    const transaction = prepareContractCall({
      contract: getCivicBadgeContract(),
      method: "function mint(address to, uint256 id, uint256 amount, bytes data)",
      params: [
        mintedBadge.walletAddress as `0x${string}`,
        BigInt(mintedBadge.onChainTokenId),
        BigInt(1),
        "0x" as `0x${string}`,
      ],
    });

    const txResult = await sendTransaction({
      transaction,
      account: minterAccount,
    });

    const txHash = txResult.transactionHash;

    // Update DB with confirmation
    await updateMintStatus(mintedBadgeId, txHash, "CONFIRMED");

    // Notify the volunteer
    const badgeName = mintedBadge.badgeType.nameIt || mintedBadge.badgeType.name;
    await createNotification(
      mintedBadge.volunteer.userId,
      "badge_minted",
      "Badge coniato con successo!",
      `Il tuo badge "${badgeName}" è stato registrato sulla blockchain.`,
      {
        mintedBadgeId: mintedBadge.id,
        transactionHash: txHash,
        tokenId: mintedBadge.onChainTokenId,
      },
    ).catch((err) => {
      console.error(
        `[minting.service] Failed to send mint notification for badge ${mintedBadge.id}:`,
        err,
      );
    });

    return { transactionHash: txHash, mintedBadgeId: mintedBadge.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown minting error";

    // Mark as FAILED in the database
    await updateMintStatus(mintedBadgeId, null, "FAILED", errorMessage);

    throw new AppError(
      `Errore durante il minting on-chain: ${errorMessage}`,
      500,
      "MINT_TRANSACTION_ERROR",
    );
  }
}

// ---------------------------------------------------------------------------
// updateMintStatus
// ---------------------------------------------------------------------------

/**
 * Update the mint status of a MintedBadge record.
 *
 * This is also called by external listeners (e.g. transaction confirmation
 * webhooks) to reconcile the state.
 */
export async function updateMintStatus(
  mintedBadgeId: string,
  txHash: string | null,
  status: "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED",
  errorMessage?: string,
): Promise<void> {
  const mintedBadge = await prisma.mintedBadge.findUnique({
    where: { id: mintedBadgeId },
  });

  if (!mintedBadge) {
    throw new NotFoundError(`MintedBadge ${mintedBadgeId} non trovato`);
  }

  await prisma.mintedBadge.update({
    where: { id: mintedBadgeId },
    data: {
      mintStatus: status,
      transactionHash: txHash ?? mintedBadge.transactionHash,
      mintedAt: status === "CONFIRMED" ? new Date() : mintedBadge.mintedAt,
      errorMessage: errorMessage ?? null,
    },
  });
}
