export type Refund = {
  id: string;
  user_id: string;
  booking_id: string;
  reason: string;
  approved: "accepted" | "pending" | "rejected";
  cancelled: boolean;
  cancelled_at: string;
  created_at: string;
};

export type createRefundDTO = Omit<
  Refund,
  "id" | "user_id" | "created_at" | "cancelled" | "cancelled_at" | "approved"
>;
export type updateRefundDTO = Omit<
  Refund,
  "id" | "user_id" | "booking_id" | "cancelled_at" | "created_at"
>;

export interface RefundRepository {
  createRefund: (
    userId: string,
    bookingId: string,
    refundDetails: createRefundDTO,
  ) => Promise<Refund>;
  editRefund: (
    refundId: string,
    userId: string,
    refundDetails: updateRefundDTO,
  ) => Promise<Refund>;
  getUserRefunds: (userId: string) => Promise<Refund[]>;
  getAllRefunds: () => Promise<Refund[]>;
  deleteRefund: (refundId: string, userId: string) => Promise<void>;
}
export interface RefundService {
  createRefund: (
    userId: string,
    bookingId: string,
    refundDetails: createRefundDTO,
  ) => Promise<Refund>;
  editRefund: (
    refundId: string,
    userId: string,
    refundDetails: updateRefundDTO,
  ) => Promise<Refund>;
  getUserRefunds: (userId: string) => Promise<Refund[]>;
  getAllRefunds: () => Promise<Refund[]>;
  deleteRefund: (refundId: string, userId: string) => Promise<void>;
}
