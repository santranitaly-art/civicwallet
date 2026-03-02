import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";

// ---------------------------------------------------------------------------
// getMerchantById
// ---------------------------------------------------------------------------

export async function getMerchantById(id: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          walletAddress: true,
          email: true,
          displayName: true,
        },
      },
      discountRules: {
        where: { isActive: true },
        include: { badgeType: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { redemptions: true },
      },
    },
  });

  if (!merchant) {
    throw new NotFoundError("Commerciante non trovato");
  }

  return merchant;
}

// ---------------------------------------------------------------------------
// getMerchantByUserId
// ---------------------------------------------------------------------------

export async function getMerchantByUserId(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          walletAddress: true,
          email: true,
          displayName: true,
        },
      },
      discountRules: {
        where: { isActive: true },
        include: { badgeType: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { redemptions: true },
      },
    },
  });

  return merchant;
}

// ---------------------------------------------------------------------------
// listMerchants
// ---------------------------------------------------------------------------

export async function listMerchants(options?: {
  activeOnly?: boolean;
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const {
    activeOnly = true,
    city,
    category,
    page = 1,
    limit = 50,
  } = options ?? {};
  const skip = (page - 1) * limit;

  const where = {
    ...(activeOnly && { isActive: true }),
    ...(city && { city: { equals: city, mode: "insensitive" as const } }),
    ...(category && { category }),
  };

  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      include: {
        user: {
          select: { displayName: true, walletAddress: true },
        },
        discountRules: {
          where: { isActive: true },
          include: { badgeType: true },
        },
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { businessName: "asc" },
      skip,
      take: limit,
    }),
    prisma.merchant.count({ where }),
  ]);

  return { merchants, total, page, limit };
}

// ---------------------------------------------------------------------------
// createMerchant
// ---------------------------------------------------------------------------

export async function createMerchant(
  userId: string,
  data: {
    businessName: string;
    vatNumber: string;
    city: string;
    province: string;
    category: string;
  },
) {
  // Verify user exists and does not already have a merchant profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { merchant: true },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  if (user.merchant) {
    throw new ConflictError("L'utente ha già un profilo commerciante");
  }

  // Check for duplicate VAT number
  const existingVat = await prisma.merchant.findUnique({
    where: { vatNumber: data.vatNumber },
  });

  if (existingVat) {
    throw new ConflictError(
      `Un commerciante con partita IVA ${data.vatNumber} esiste già`,
    );
  }

  const merchant = await prisma.merchant.create({
    data: {
      userId,
      businessName: data.businessName,
      vatNumber: data.vatNumber,
      city: data.city,
      province: data.province.toUpperCase(),
      category: data.category,
    },
  });

  return merchant;
}

// ---------------------------------------------------------------------------
// updateMerchant
// ---------------------------------------------------------------------------

export async function updateMerchant(
  id: string,
  data: {
    businessName?: string;
    city?: string;
    province?: string;
    category?: string;
    isActive?: boolean;
  },
) {
  const merchant = await prisma.merchant.findUnique({ where: { id } });

  if (!merchant) {
    throw new NotFoundError("Commerciante non trovato");
  }

  const updated = await prisma.merchant.update({
    where: { id },
    data: {
      ...(data.businessName !== undefined && { businessName: data.businessName }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.province !== undefined && { province: data.province.toUpperCase() }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// deleteMerchant (soft delete)
// ---------------------------------------------------------------------------

export async function deleteMerchant(id: string) {
  const merchant = await prisma.merchant.findUnique({ where: { id } });

  if (!merchant) {
    throw new NotFoundError("Commerciante non trovato");
  }

  const updated = await prisma.merchant.update({
    where: { id },
    data: { isActive: false },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Discount Rule Management
// ---------------------------------------------------------------------------

/**
 * Create a discount rule for a merchant. The rule links a BadgeType to a
 * discount percentage that volunteers holding that badge can redeem.
 */
export async function createDiscountRule(
  merchantId: string,
  data: {
    badgeTypeId: string;
    discountPercent: number;
    description: string;
    descriptionIt: string;
    validUntil?: string;
    maxRedemptions?: number;
  },
) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    throw new NotFoundError("Commerciante non trovato");
  }

  if (!merchant.isActive) {
    throw new ValidationError("Il commerciante non è attivo");
  }

  // Verify badge type exists
  const badgeType = await prisma.badgeType.findUnique({
    where: { id: data.badgeTypeId },
  });

  if (!badgeType) {
    throw new NotFoundError("Tipo di badge non trovato");
  }

  if (data.discountPercent < 1 || data.discountPercent > 100) {
    throw new ValidationError("La percentuale di sconto deve essere compresa tra 1 e 100");
  }

  const discountRule = await prisma.discountRule.create({
    data: {
      merchantId,
      badgeTypeId: data.badgeTypeId,
      discountPercent: data.discountPercent,
      description: data.description,
      descriptionIt: data.descriptionIt,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      maxRedemptions: data.maxRedemptions ?? null,
    },
    include: { badgeType: true },
  });

  return discountRule;
}

/**
 * Update an existing discount rule.
 */
export async function updateDiscountRule(
  ruleId: string,
  merchantId: string,
  data: {
    discountPercent?: number;
    description?: string;
    descriptionIt?: string;
    validUntil?: string | null;
    maxRedemptions?: number | null;
    isActive?: boolean;
  },
) {
  const rule = await prisma.discountRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new NotFoundError("Regola sconto non trovata");
  }

  if (rule.merchantId !== merchantId) {
    throw new ValidationError("La regola sconto non appartiene a questo commerciante");
  }

  if (data.discountPercent !== undefined && (data.discountPercent < 1 || data.discountPercent > 100)) {
    throw new ValidationError("La percentuale di sconto deve essere compresa tra 1 e 100");
  }

  const updated = await prisma.discountRule.update({
    where: { id: ruleId },
    data: {
      ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.descriptionIt !== undefined && { descriptionIt: data.descriptionIt }),
      ...(data.validUntil !== undefined && {
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      }),
      ...(data.maxRedemptions !== undefined && { maxRedemptions: data.maxRedemptions }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: { badgeType: true },
  });

  return updated;
}

/**
 * Delete (deactivate) a discount rule.
 */
export async function deleteDiscountRule(ruleId: string, merchantId: string) {
  const rule = await prisma.discountRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new NotFoundError("Regola sconto non trovata");
  }

  if (rule.merchantId !== merchantId) {
    throw new ValidationError("La regola sconto non appartiene a questo commerciante");
  }

  const updated = await prisma.discountRule.update({
    where: { id: ruleId },
    data: { isActive: false },
  });

  return updated;
}

/**
 * Get all discount rules for a specific merchant (active or all).
 */
export async function getDiscountRules(
  merchantId: string,
  activeOnly = true,
) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    throw new NotFoundError("Commerciante non trovato");
  }

  const rules = await prisma.discountRule.findMany({
    where: {
      merchantId,
      ...(activeOnly && { isActive: true }),
    },
    include: {
      badgeType: true,
      _count: {
        select: { redemptions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rules;
}

/**
 * Record a discount redemption by a volunteer at a merchant.
 * Validates that the discount rule is active, not expired, and the
 * max redemptions cap has not been reached.
 */
export async function redeemDiscount(
  discountRuleId: string,
  volunteerWallet: string,
) {
  const rule = await prisma.discountRule.findUnique({
    where: { id: discountRuleId },
    include: {
      _count: { select: { redemptions: true } },
    },
  });

  if (!rule) {
    throw new NotFoundError("Regola sconto non trovata");
  }

  if (!rule.isActive) {
    throw new ValidationError("Questa offerta non è più attiva");
  }

  if (rule.validUntil && rule.validUntil < new Date()) {
    throw new ValidationError("Questa offerta è scaduta");
  }

  if (rule.maxRedemptions && rule._count.redemptions >= rule.maxRedemptions) {
    throw new ValidationError("Il numero massimo di utilizzi è stato raggiunto");
  }

  const redemption = await prisma.redemption.create({
    data: {
      discountRuleId: rule.id,
      merchantId: rule.merchantId,
      volunteerWallet,
    },
  });

  return redemption;
}
