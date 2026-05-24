import type {
  PaymentRepository,
  Payment,
  InitiatePaymentResponse,
  MpesaCallbackBody,
  MpesaCallbackMetaItem,
  StripeInitiateDTO,
  StripeInitiateResponse,
} from "./payments.types.js";
import { MpesaInternalService } from "./Methods/M-Pesa/mpesa.service.js";
import { StripeInternalService } from "./Methods/Bank/stripe.service.js";

export class PaymentServ {
  private mpesa = new MpesaInternalService();
  private stripe = new StripeInternalService();

  constructor(private repo: PaymentRepository) {}

  // ── M-Pesa ─────────────────────────────────────────────────────────────────

  async initiateMpesa(
    userId: string,
    bookingId: string,
    amount: number,
    phone: string,
  ): Promise<InitiatePaymentResponse> {
    // 1. Persist a pending payment record
    const payment = await this.repo.createPayment({
      user_id: userId,
      booking_id: bookingId,
      amount,
      payment_method: "m-pesa",
      phone_number: phone,
    });

    // 2. Trigger STK Push — throws on Safaricom error
    const mpesaRes = await this.mpesa.initiateStkPush(
      phone,
      amount,
      payment.id,
    );

    // 3. Store MerchantRequestID so we can match the callback later
    await this.repo.editPayment(payment.id, {
      transaction_reference: mpesaRes.MerchantRequestID,
    });

    return {
      message: "STK Push sent — awaiting customer confirmation",
      paymentId: payment.id,
    };
  }

  /**
   * Called by Safaricom when the customer completes or dismisses the STK prompt.
   * ResultCode === 0  → success
   * ResultCode !== 0  → user cancelled or timed out
   */
  async handleMpesaCallback(body: MpesaCallbackBody): Promise<void> {
    const { ResultCode, MerchantRequestID, CallbackMetadata } =
      body.Body.stkCallback;

    const payment = await this.repo.getPaymentByReference(MerchantRequestID);
    if (!payment) {
      // Safaricom sometimes retries; log and swallow so we always return 200
      console.warn(
        `[M-Pesa callback] Unknown MerchantRequestID: ${MerchantRequestID}`,
      );
      return;
    }

    if (ResultCode === 0) {
      const receipt = this.extractMetaValue(
        CallbackMetadata?.Item ?? [],
        "MpesaReceiptNumber",
      );

      await this.repo.editPayment(payment.id, {
        payment_status: "paid",
        transaction_reference: receipt ?? MerchantRequestID,
        paid_at: new Date().toISOString(),
      });
    } else {
      await this.repo.editPayment(payment.id, {
        payment_status: "failed",
      });
    }
  }

  // ── Stripe ─────────────────────────────────────────────────────────────────

  async initiateStripe(
    userId: string,
    dto: StripeInitiateDTO,
  ): Promise<StripeInitiateResponse> {
    // 1. Persist a pending payment record
    const payment = await this.repo.createPayment({
      user_id: userId,
      booking_id: dto.booking_id,
      amount: dto.amount,
      payment_method: "bank",
    });

    // 2. Create + confirm PaymentIntent — throws on Stripe error
    const intent = await this.stripe.createAndConfirmPaymentIntent(
      dto.payment_method_id,
      dto.amount,
      payment.id,
      dto.email,
    );

    // 3. Store the PaymentIntent ID (pi_xxx) as our reference for webhook matching
    await this.repo.editPayment(payment.id, {
      transaction_reference: intent.id,
    });

    // 4. Handle the immediate result
    if (intent.status === "succeeded") {
      // Card was charged synchronously (no 3DS required)
      await this.repo.editPayment(payment.id, {
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      });

      return {
        message: "Payment successful",
        paymentId: payment.id,
        stripeStatus: intent.status,
      };
    }

    // requires_action → frontend must call stripe.handleNextAction(clientSecret)
    return {
      message: "Payment initiated — further action may be required",
      paymentId: payment.id,
      clientSecret: intent.client_secret,
      stripeStatus: intent.status,
    };
  }

  /**
   * Handles Stripe webhook events. The raw body Buffer must be passed in
   * (not parsed JSON) so the signature can be verified correctly.
   *
   * Relevant events:
   *   payment_intent.succeeded         → mark paid
   *   payment_intent.payment_failed    → mark failed
   */
  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    // Throws on bad signature — let the controller return 400
    const event = this.stripe.verifyWebhookSignature(rawBody, signature);

    const { type, data } = event;
    const intent = data.object;

    // We only care about PaymentIntent events
    if (!type.startsWith("payment_intent.")) return;

    // Retrieve our internal payment ID from metadata we set during creation
    const paymentId = intent.metadata?.paymentId;
    if (!paymentId) {
      console.warn(
        `[Stripe webhook] No paymentId in metadata for intent ${intent.id}`,
      );
      return;
    }

    const payment = await this.repo.getPaymentById(paymentId);
    if (!payment) {
      console.warn(`[Stripe webhook] Payment ${paymentId} not found in DB`);
      return;
    }

    switch (type) {
      case "payment_intent.succeeded":
        await this.repo.editPayment(payment.id, {
          payment_status: "paid",
          transaction_reference: intent.id,
          paid_at: new Date().toISOString(),
        });
        break;

      case "payment_intent.payment_failed":
        await this.repo.editPayment(payment.id, {
          payment_status: "failed",
          transaction_reference: intent.id,
        });
        break;

      default:
        // Log unhandled events but don't error — Stripe sends many event types
        console.info(`[Stripe webhook] Unhandled event type: ${type}`);
    }
  }

  // ── Shared CRUD ────────────────────────────────────────────────────────────

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.repo.getPaymentById(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.repo.getUserPayments(userId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.repo.getAllPayments();
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    const payment = await this.repo.getPaymentById(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    if (payment.user_id !== userId) throw new Error("Forbidden");
    return this.repo.deletePayment(userId, paymentId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private extractMetaValue(
    items: MpesaCallbackMetaItem[],
    name: string,
  ): string | null {
    const item = items.find((i) => i.Name === name);
    return item?.Value != null ? String(item.Value) : null;
  }
}
