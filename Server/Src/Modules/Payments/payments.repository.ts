import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type {
  createPaymentDTO,
  Payment,
  PaymentRepository,
  updatePaymentDTO,
} from "./payments.types.js";

export class PaymentRepo implements PaymentRepository {
  constructor(public db: Database) {}

  async initializePayment(
    userId: string,
    paymentDetails: createPaymentDTO,
  ): Promise<Payment> {
    try {
      let sqlString: string = `INSERT INTO payments(user_id,booking_id,quote,transaction_reference) VALUES($1,$2,$3,$4) RETURNING *`,
        sqlQuery: QueryResult<any> = await this.db.query(sqlString, [
          userId,
          paymentDetails.bookingId,
          paymentDetails.quoteType,
          paymentDetails.referenceId,
        ]),
        result = sqlQuery.rows;

      return result[0];
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async updatePayment(
    userId: string,
    reference: string,
    newPaymentDetails: updatePaymentDTO,
  ) {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex = 3;

      for (let [key, value] of Object.entries(newPaymentDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlString = `UPDATE payments SET ${keys.join(",")} WHERE user_id=$1 AND transaction_reference=$2 RETURN *`,
        sqlQuery: QueryResult = await this.db.query(sqlString, [
          userId,
          reference,
          ...values,
        ]),
        sqlResult = sqlQuery.rows;

      return sqlResult[0];
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserTransactions(userId: string): Promise<Payment[]> {
    try {
      let sqlString: string = `SELECT * FROM payments WHERE user_id=$1`,
        sqlQuery: QueryResult<Payment> = await this.db.query(sqlString, [
          userId,
        ]),
        result = sqlQuery.rows;

      return result;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
