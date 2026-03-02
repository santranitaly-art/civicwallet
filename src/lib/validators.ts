import { z } from "zod";

export const webhookPayloadSchema = z.object({
  event: z.literal("shift_completed"),
  timestamp: z.string().datetime(),
  data: z.object({
    volunteerId: z.string().min(1),
    associationCode: z.string().min(1),
    shiftDate: z.string().datetime(),
    hoursWorked: z.number().positive().max(24),
    activityType: z.string().min(1),
    description: z.string().optional(),
    referenceId: z.string().min(1),
  }),
  signature: z.string().min(1),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export const claimBadgeSchema = z.object({
  claimId: z.string().cuid(),
});

export const qrGenerateSchema = z.object({
  badgeTokenIds: z.array(z.number().int().positive()).min(1),
});

export const qrValidateSchema = z.object({
  token: z.string().min(1),
});

export const createAssociationSchema = z.object({
  name: z.string().min(2).max(200),
  fiscalCode: z.string().length(11),
  city: z.string().min(1),
  province: z.string().length(2),
  region: z.string().min(1),
});

export const createMerchantSchema = z.object({
  businessName: z.string().min(2).max(200),
  vatNumber: z.string().length(11),
  city: z.string().min(1),
  province: z.string().length(2),
  category: z.string().min(1),
});

export const createDiscountRuleSchema = z.object({
  badgeTypeId: z.string().cuid(),
  discountPercent: z.number().int().min(1).max(100),
  description: z.string().min(1),
  descriptionIt: z.string().min(1),
  validUntil: z.string().datetime().optional(),
  maxRedemptions: z.number().int().positive().optional(),
});

export const onboardingSchema = z.object({
  displayName: z.string().min(2).max(100),
  associationId: z.string().cuid().optional(),
  gdprConsent: z.literal(true),
});

export const manualMintSchema = z.object({
  volunteerId: z.string().cuid(),
  badgeTokenId: z.number().int().positive(),
  reason: z.string().min(1),
});
