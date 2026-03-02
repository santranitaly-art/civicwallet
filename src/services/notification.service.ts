import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";

// ---------------------------------------------------------------------------
// createNotification
// ---------------------------------------------------------------------------

/**
 * Create a notification for a user.
 *
 * @param userId   - Target user ID.
 * @param type     - Notification type key (e.g. "badge_available", "badge_minted", "discount_new").
 * @param title    - Short human-readable title (Italian).
 * @param body     - Notification body text (Italian).
 * @param metadata - Optional JSON-serializable metadata for the frontend
 *                   (e.g. claimId, transactionHash).
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, unknown>,
): Promise<{ notificationId: string }> {
  if (!userId) {
    throw new ValidationError("userId è obbligatorio");
  }

  // Verify the target user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError(`Utente ${userId} non trovato`);
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });

  return { notificationId: notification.id };
}

// ---------------------------------------------------------------------------
// getUnreadNotifications
// ---------------------------------------------------------------------------

/**
 * Retrieve all unread notifications for a user, ordered newest-first.
 */
export async function getUnreadNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      readAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications;
}

// ---------------------------------------------------------------------------
// getAllNotifications
// ---------------------------------------------------------------------------

/**
 * Retrieve all notifications for a user (read and unread) with pagination.
 */
export async function getAllNotifications(
  userId: string,
  options?: { page?: number; limit?: number },
) {
  const { page = 1, limit = 30 } = options ?? {};
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { notifications, total, page, limit };
}

// ---------------------------------------------------------------------------
// markAsRead
// ---------------------------------------------------------------------------

/**
 * Mark a single notification as read.
 *
 * @param notificationId - The notification to mark as read.
 * @param userId         - The owner user ID (prevents cross-user mutation).
 */
export async function markAsRead(
  notificationId: string,
  userId?: string,
): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotFoundError("Notifica non trovata");
  }

  // Ownership check when userId is provided
  if (userId && notification.userId !== userId) {
    throw new NotFoundError("Notifica non trovata");
  }

  // Idempotent — skip if already read
  if (notification.readAt) {
    return;
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// markAllAsRead
// ---------------------------------------------------------------------------

/**
 * Mark all unread notifications for a user as read in a single operation.
 */
export async function markAllAsRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return { count: result.count };
}

// ---------------------------------------------------------------------------
// getUnreadCount
// ---------------------------------------------------------------------------

/**
 * Return the count of unread notifications for a user.
 * Useful for badge counters in the UI navbar.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}
