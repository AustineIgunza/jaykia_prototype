// ─── Core Payment Entity ──────────────────────────────────────────────────────

export type PaymentMethod = "m-pesa" | "bank";
export type PaymentStatus = "paid" | "pending" | "cancelled" | "failed";

export type Payment = {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  /**
   * M-Pesa  → MerchantRequestID during initiation, MpesaReceiptNumber on success
   * Stripe  → PaymentIntent ID (pi_xxx) throughout the lifecycle
   */
  transaction_reference: string | null;
  phone_number: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export type CreatePaymentDTO = {
  user_id: string;
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  phone_number?: string;
};

export type UpdatePaymentDTO = {
  payment_status?: PaymentStatus;
  transaction_reference?: string;
  paid_at?: string;
};

// ─── M-Pesa specific types ────────────────────────────────────────────────────

export type MpesaStkPushResponse = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

export type MpesaCallbackMetaItem = {
  Name: string;
  Value?: string | number;
};

export type MpesaCallbackBody = {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: MpesaCallbackMetaItem[];
      };
    };
  };
};

// ─── Stripe specific types ────────────────────────────────────────────────────

export type StripeInitiateDTO = {
  booking_id: string;
  amount: number;
  /** Stripe PaymentMethod ID (pm_xxx) collected on the frontend via Stripe.js */
  payment_method_id: string;
  /** Optional: customer email for Stripe receipts */
  email?: string;
};

export type StripeInitiateResponse = {
  message: string;
  paymentId: string;
  /** Pass back to frontend — only present when 3DS confirmation is needed */
  clientSecret?: string;
  /** "succeeded" | "requires_action" | "requires_payment_method" */
  stripeStatus: string;
};

/**
 * Minimal shape of a Stripe webhook Event.
 * Install @types/stripe or the stripe npm package for the full type.
 */
export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string; // PaymentIntent ID  (pi_xxx)
      status: string; // "succeeded" | "payment_failed" | …
      amount: number; // in smallest currency unit (cents)
      metadata: Record<string, string>; // we store paymentId here
      latest_charge?: string; // charge ID if needed for receipts
    };
  };
};

// ─── Shared response ──────────────────────────────────────────────────────────

export type InitiatePaymentResponse = {
  message: string;
  paymentId: string;
};

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface PaymentRepository {
  createPayment: (data: CreatePaymentDTO) => Promise<Payment>;
  editPayment: (paymentId: string, data: UpdatePaymentDTO) => Promise<Payment>;
  getPaymentByReference: (ref: string) => Promise<Payment | null>;
  getPaymentById: (id: string) => Promise<Payment | null>;
  getUserPayments: (userId: string) => Promise<Payment[]>;
  getAllPayments: () => Promise<Payment[]>;
  deletePayment: (userId: string, paymentId: string) => Promise<void>;
}
