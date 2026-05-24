export type Payment = {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  payment_method: "m-pesa" | "bank";
  payment_status: "paid" | "pending" | "cancelled";
  transaction_reference: string;
  paid_at: string;
  created_at: string;
};

export type createPaymentDTO = Omit<
  Payment,
  | "id"
  | "user_id"
  | "payment_status"
  | "transaction_reference"
  | "paid_at"
  | "created_at"
>;
export type updatePaymentDTO = Pick<
  Payment,
  "booking_id" | "payment_status" | "transaction_reference"
>;

export interface PaymentRepository {
  createPayment: (
    user_id: string,
    booking_id: string,
    paymentDetails: createPaymentDTO,
  ) => Promise<Payment>;
  editPayment: (userId: string, paymentId: string) => Promise<Payment>;
  getUserPayments: (userId: string) => Promise<Payment[]>;
  getAllPayments: () => Promise<Payment>;
  getPayment: (paymentId: string) => Promise<Payment>;
  deletePayment: (userId: string, paymentId: string) => Promise<void>;
}
export interface PaymentService {
  createPayment: (
    user_id: string,
    booking_id: string,
    paymentDetails: createPaymentDTO,
  ) => Promise<Payment>;
  editPayment: (userId: string, paymentId: string) => Promise<Payment>;
  getUserPayments: (userId: string) => Promise<Payment[]>;
  getAllPayments: () => Promise<Payment>;
  getPayment: (paymentId: string) => Promise<Payment>;
  deletePayment: (userId: string, paymentId: string) => Promise<void>;
}
