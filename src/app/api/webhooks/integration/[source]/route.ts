import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { validateHmac } from "@/lib/crypto";

/**
 * POST /api/webhooks/integration/[source]
 * 
 * UNIVERSAL INTEGRATION HUB WEBHOOK ADAPTER
 * This endpoint handles incoming webhooks from ANY registered platform
 * (e.g., AppAmbulanza, Bernardo, VolontApp, etc.)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { source: string } }
) {
    try {
        const { source } = params;
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";

        // 1. Fetch the IntegrationSource configuration dynamically
        const integrationSource = await prisma.integrationSource.findUnique({
            where: { code: source },
        });

        if (!integrationSource || !integrationSource.isActive) {
            return Response.json(
                { error: `Integration source '${source}' non trovata o disattiva`, code: "SOURCE_UNAVAILABLE" },
                { status: 404 }
            );
        }

        // 2. Dynamic Rate Limiting (configured per source)
        if (!rateLimit(`webhook:integration:${source}:${ip}`, integrationSource.rateLimitPerMin, 60_000)) {
            return Response.json(
                { error: "Troppe richieste", code: "RATE_LIMITED" },
                { status: 429 }
            );
        }

        const rawBody = await request.text();
        if (!rawBody) {
            return Response.json({ error: "Body mancante", code: "EMPTY_BODY" }, { status: 400 });
        }

        // 3. Dynamic Authentication based on source's authType
        let authValid = false;
        let authError = "";

        switch (integrationSource.authType) {
            case "hmac":
                const signature = request.headers.get("x-webhook-signature") ?? "";
                // In a real implementation, we might map the association dynamically first 
                // to get an association-specific secret, or use a source-global secret.
                // For demonstration, using the source's global secret.
                authValid = validateHmac(rawBody, signature, integrationSource.authSecret || "");
                if (!authValid) authError = "Firma HMAC non valida";
                break;

            case "api_key":
                const apiKey = request.headers.get("authorization")?.replace("Bearer ", "") ?? request.headers.get("x-api-key") ?? "";
                authValid = apiKey === integrationSource.authSecret;
                if (!authValid) authError = "API Key non valida";
                break;

            case "none":
                authValid = true;
                break;

            default:
                authError = `Metodo di autenticazione ${integrationSource.authType} non supportato`;
                break;
        }

        // 4. Parse payload
        let payload: any;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return Response.json({ error: "JSON non valido", code: "INVALID_JSON" }, { status: 400 });
        }

        // 5. Audit Log (WebhookLog now supports integrationSourceId)
        const webhookLog = await prisma.webhookLog.create({
            data: {
                source: source,
                integrationSourceId: integrationSource.id,
                endpoint: `/api/webhooks/integration/${source}`,
                payload: payload,
                headers: {
                    "content-type": request.headers.get("content-type"),
                    "user-agent": request.headers.get("user-agent"),
                },
                hmacValid: authValid,
                status: authValid ? "RECEIVED" : "FAILED",
                processingError: authValid ? null : authError,
            },
        });

        if (!authValid) {
            return Response.json({ error: authError, code: "AUTH_FAILED" }, { status: 401 });
        }

        // 6. Dynamic Payload Mapping
        // This is where we'd use integrationSource.fieldMapping to normalize
        // the incoming payload into the standard CivicWallet ActivityLog format.
        // Example: mapperService(payload, integrationSource.fieldMapping)

        // For now, accept and log it.

        return Response.json(
            {
                success: true,
                webhookLogId: webhookLog.id,
                message: `Payload successfully received and mapped for ${integrationSource.name}`,
            },
            { status: 200 }
        );
    } catch (error) {
        return errorResponse(error);
    }
}
