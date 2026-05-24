import * as https from "https";
import * as crypto from "crypto";
import type { StripeWebhookEvent } from "../../payments.types.js";

// ─── Stripe API helper ────────────────────────────────────────────────────────

/**
 * Minimal Stripe REST client — no SDK dependency.
 * Uses application/x-www-form-urlencoded as required by the Stripe API.
 */
function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");

  const body = params ? new URLSearchParams(params).toString() : undefined;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.stripe.com",
        path,
        method,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data) as T & {
              error?: { message: string };
            };
            if ((parsed as any).error) {
              reject(new Error((parsed as any).error.message));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`Failed to parse Stripe response: ${data}`));
          }
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── Types returned from Stripe API ──────────────────────────────────────────

type StripePaymentIntent = {
  id: string;
  status: string;
  client_secret: string;
  amount: number;
  currency: string;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export class StripeInternalService {
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  private readonly currency = process.env.STRIPE_CURRENCY ?? "usd";

  /**
   * Creates and immediately confirms a PaymentIntent in one step.
   *
   * @param paymentMethodId - pm_xxx from Stripe.js on the frontend
   * @param amount          - in major currency units (e.g. 150 = $1.50 or KES 150)
   * @param paymentId       - our internal DB payment ID, stored in metadata
   * @param email           - optional email for Stripe receipt
   */
  async createAndConfirmPaymentIntent(
    paymentMethodId: string,
    amount: number,
    paymentId: string,
    email?: string,
  ): Promise<StripePaymentIntent> {
    // Stripe amounts are in the smallest currency unit (cents, fils, etc.)
    const amountInSmallestUnit = Math.round(amount * 100);

    const params: Record<string, string> = {
      amount: String(amountInSmallestUnit),
      currency: this.currency,
      payment_method: paymentMethodId,
      confirm: "true",
      // Return URL required for 3DS redirect flows
      return_url:
        process.env.STRIPE_RETURN_URL ??
        "https://yourdomain.com/payment/complete",
      // Automatic payment methods so Stripe handles method compatibility
      "automatic_payment_methods[enabled]": "true",
      "automatic_payment_methods[allow_redirects]": "never",
      // Store our internal ID so the webhook can look the payment up
      "metadata[paymentId]": paymentId,
    };

    if (email) {
      params.receipt_email = email;
    }

    return stripeRequest<StripePaymentIntent>(
      "POST",
      "/v1/payment_intents",
      params,
    );
  }

  /**
   * Verifies the Stripe-Signature header and reconstructs the event.
   * Throws if the signature is invalid — always call this before trusting webhook data.
   *
   * @param rawBody  - the raw request body Buffer (must NOT be JSON.parsed first)
   * @param signature - value of the `stripe-signature` header
   */
  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
  ): StripeWebhookEvent {
    if (!this.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    // Stripe's signature scheme: t=timestamp,v1=hmac,...
    const parts = signature
      .split(",")
      .reduce<Record<string, string>>((acc, part) => {
        const [key, val] = part.split("=");
        if (key && val) {
          acc[key] = val;
        }
        return acc;
      }, {});

    const timestamp = parts["t"];
    const receivedSig = parts["v1"];

    if (!timestamp || !receivedSig) {
      throw new Error("Malformed Stripe-Signature header");
    }

    // Reject events older than 5 minutes to prevent replay attacks
    const tolerance = 5 * 60; // seconds
    const age = Math.floor(Date.now() / 1000) - Number(timestamp);
    if (age > tolerance) {
      throw new Error(`Stripe webhook timestamp too old (${age}s)`);
    }

    const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
    const expectedSig = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(signedPayload)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(receivedSig),
        Buffer.from(expectedSig),
      )
    ) {
      throw new Error("Stripe webhook signature mismatch");
    }

    return JSON.parse(rawBody.toString("utf8")) as StripeWebhookEvent;
  }
}
