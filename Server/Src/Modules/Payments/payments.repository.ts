import { Database } from "../../Config/DB.js";
import type {
  CreatePaymentDTO,
  Payment,
  PaymentRepository,
  UpdatePaymentDTO,
} from "./payments.types.js";

// Fields that are allowed to be updated — prevents injection via key names
const ALLOWED_UPDATE_FIELDS: (keyof UpdatePaymentDTO)[] = [
  "payment_status",
  "transaction_reference",
  "paid_at",
];

export class PaymentRepo implements PaymentRepository {
  constructor(private db: Database) {}

  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    const query = `
      INSERT INTO payments
        (user_id, booking_id, amount, payment_method, phone_number, payment_status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `;
    const result = await this.db.query(query, [
      data.user_id,
      data.booking_id,
      data.amount,
      data.payment_method,
      data.phone_number ?? null,
    ]);
    return result.rows[0];
  }

  async editPayment(
    paymentId: string,
    data: UpdatePaymentDTO,
  ): Promise<Payment> {
    // Only pick whitelisted keys so no arbitrary column injection is possible
    const entries = Object.entries(data).filter(([key]) =>
      ALLOWED_UPDATE_FIELDS.includes(key as keyof UpdatePaymentDTO),
    );

    if (entries.length === 0) {
      throw new Error("No valid fields provided for update");
    }

    const sets = entries.map(([key], i) => `${key} = $${i + 2}`).join(", ");
    const values = entries.map(([, val]) => val);

    const query = `
      UPDATE payments
      SET ${sets}
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.db.query(query, [paymentId, ...values]);

    if (result.rows.length === 0) {
      throw new Error(`Payment ${paymentId} not found`);
    }
    return result.rows[0];
  }

  async getPaymentByReference(ref: string): Promise<Payment | null> {
    const result = await this.db.query(
      "SELECT * FROM payments WHERE transaction_reference = $1",
      [ref],
    );
    return result.rows[0] ?? null;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const result = await this.db.query("SELECT * FROM payments WHERE id = $1", [
      id,
    ]);
    return result.rows[0] ?? null;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    const result = await this.db.query(
      "SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows;
  }

  async getAllPayments(): Promise<Payment[]> {
    const result = await this.db.query(
      "SELECT * FROM payments ORDER BY created_at DESC",
    );
    return result.rows;
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    await this.db.query("DELETE FROM payments WHERE id = $1 AND user_id = $2", [
      paymentId,
      userId,
    ]);
  }
}
