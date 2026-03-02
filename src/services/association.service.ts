import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { generateHmacSecret } from "@/lib/crypto";

// ---------------------------------------------------------------------------
// getAssociationById
// ---------------------------------------------------------------------------

export async function getAssociationById(id: string) {
  const association = await prisma.association.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          volunteers: true,
          etsAdmins: true,
          activityLogs: true,
        },
      },
    },
  });

  if (!association) {
    throw new NotFoundError("Associazione non trovata");
  }

  return association;
}

// ---------------------------------------------------------------------------
// getByFiscalCode
// ---------------------------------------------------------------------------

/**
 * Retrieve an association by its Italian fiscal code (Codice Fiscale).
 * Returns `null` if not found (does not throw).
 */
export async function getByFiscalCode(fiscalCode: string) {
  if (!fiscalCode || fiscalCode.length !== 11) {
    throw new ValidationError("Codice fiscale non valido (deve essere di 11 caratteri)");
  }

  const association = await prisma.association.findUnique({
    where: { fiscalCode },
    include: {
      _count: {
        select: {
          volunteers: true,
          etsAdmins: true,
        },
      },
    },
  });

  return association;
}

// ---------------------------------------------------------------------------
// listAssociations
// ---------------------------------------------------------------------------

export async function listAssociations(options?: {
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const { activeOnly = true, page = 1, limit = 50 } = options ?? {};
  const skip = (page - 1) * limit;

  const where = activeOnly ? { isActive: true } : {};

  const [associations, total] = await Promise.all([
    prisma.association.findMany({
      where,
      include: {
        _count: {
          select: { volunteers: true },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.association.count({ where }),
  ]);

  return { associations, total, page, limit };
}

// ---------------------------------------------------------------------------
// createAssociation
// ---------------------------------------------------------------------------

export async function createAssociation(data: {
  name: string;
  fiscalCode: string;
  city: string;
  province: string;
  region: string;
}) {
  // Check for duplicate fiscal code
  const existing = await prisma.association.findUnique({
    where: { fiscalCode: data.fiscalCode },
  });

  if (existing) {
    throw new ConflictError(
      `Un'associazione con codice fiscale ${data.fiscalCode} esiste già`,
    );
  }

  // Generate a unique HMAC secret for webhook signature validation
  const webhookSecret = generateHmacSecret();

  const association = await prisma.association.create({
    data: {
      name: data.name,
      fiscalCode: data.fiscalCode,
      city: data.city,
      province: data.province.toUpperCase(),
      region: data.region,
      webhookSecret,
    },
  });

  return association;
}

// ---------------------------------------------------------------------------
// updateAssociation
// ---------------------------------------------------------------------------

export async function updateAssociation(
  id: string,
  data: {
    name?: string;
    city?: string;
    province?: string;
    region?: string;
    isActive?: boolean;
  },
) {
  const association = await prisma.association.findUnique({
    where: { id },
  });

  if (!association) {
    throw new NotFoundError("Associazione non trovata");
  }

  const updated = await prisma.association.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.province !== undefined && { province: data.province.toUpperCase() }),
      ...(data.region !== undefined && { region: data.region }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// deleteAssociation (soft delete)
// ---------------------------------------------------------------------------

/**
 * Soft-delete an association by marking it inactive.
 * Hard deletes are intentionally not supported to preserve referential
 * integrity with activity logs and volunteers.
 */
export async function deleteAssociation(id: string) {
  const association = await prisma.association.findUnique({
    where: { id },
  });

  if (!association) {
    throw new NotFoundError("Associazione non trovata");
  }

  const updated = await prisma.association.update({
    where: { id },
    data: { isActive: false },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// rotateWebhookSecret
// ---------------------------------------------------------------------------

/**
 * Regenerate the HMAC webhook secret for an association.
 * This invalidates all existing webhook signatures from AppAmbulanza
 * for this association until the new secret is configured.
 */
export async function rotateWebhookSecret(id: string): Promise<{
  associationId: string;
  webhookSecret: string;
}> {
  const association = await prisma.association.findUnique({
    where: { id },
  });

  if (!association) {
    throw new NotFoundError("Associazione non trovata");
  }

  const newSecret = generateHmacSecret();

  await prisma.association.update({
    where: { id },
    data: { webhookSecret: newSecret },
  });

  return { associationId: id, webhookSecret: newSecret };
}
