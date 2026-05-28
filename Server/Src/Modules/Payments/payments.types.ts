import type { PayStackInitializor } from "./Paystack/paystack.types.js";

export type PaymentMethods = "mobile" | "bank";
export type PaymentStatus = "pending" | "paid" | "failed";
export type QuoteType = "payment" | "invoice";

export type Payment = {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number | string;
  payment_method: PaymentMethods;
  payment_status: PaymentStatus;
  transaction_reference: string;
  paid_at: string;
};

export type createPaymentDTO = {
  bookingId: string;
  quoteType: QuoteType;
  referenceId: string;
  amount: number;
  paymentStatus: PaymentStatus;
};
export type updatePaymentDTO = {
  bookingId: string;
  payment_status: string;
};

export interface PaymentRepository {
  initializePayment: (
    userId: string,
    paymentDetails: createPaymentDTO,
  ) => Promise<Payment>;
  updatePayment: (
    userId: string,
    reference: string,
    newPaymentDetails: updatePaymentDTO,
  ) => Promise<any>;
  getUserTransactions: (userId: string) => Promise<Payment[]>;
}
export interface PaymentService {
  initializeTransaction: (
    userId: string,
    bookingId: string,
    amount: number,
  ) => Promise<PayStackInitializor>;
  initializeInvoice: (
    userId: string,
    bookingId: string,
    amount: number,
  ) => Promise<any>;
  updatePayment: (
    userId: string,
    reference: string,
    newPaymentDetails: updatePaymentDTO,
  ) => Promise<any>;
  getUserTransactions: (userId: string) => Promise<Payment[]>;
}
