import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type {
  createRefundDTO,
  Refund,
  RefundRepository,
  updateRefundDTO,
} from "./refund.types.js";

export class RefundRepo implements RefundRepository {
  constructor(private db: Database) {}

  async createRefund(
    userId: string,
    bookingId: string,
    refundDetails: createRefundDTO,
  ): Promise<Refund> {
    try {
      const sqlString: string =
          "INSERT INTO refunds(user_id,booking_id,reason,approved) VALUES($1,$2,$3,$4) RETURNING *",
        sqlQuery: QueryResult<Refund> = await this.db.query(sqlString, [
          userId,
          bookingId,
          refundDetails.reason,
          "pending",
        ]),
        refundCreation = sqlQuery.rows[0];

      return refundCreation!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editRefund(
    refundId: string,
    userId: string,
    refundDetails: updateRefundDTO,
  ): Promise<Refund> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 3;

      for (let [key, value] of Object.entries(refundDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlString: string = `UPDATE refunds SET ${keys.join(",")} WHERE id=$1 and user_id=$2 RETURNING *`,
        sqlQuery: QueryResult<Refund> = await this.db.query(sqlString, [
          refundId,
          userId,
          ...values,
        ]),
        editResult = sqlQuery.rows[0];

      return editResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserRefunds(userId: string): Promise<Refund[]> {
    try {
      const sqlString: string = "SELECT * FROM refunds WHERE user_id=$1",
        sqlQuery: QueryResult<Refund> = await this.db.query(sqlString, [
          userId,
        ]),
        userRefunds = sqlQuery.rows;

      return userRefunds;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getAllRefunds(): Promise<Refund[]> {
    try {
      const sqlString: string = "SELECT * FROM refunds",
        sqlQuery: QueryResult<Refund> = await this.db.query(sqlString),
        refunds = sqlQuery.rows;

      return refunds;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteRefund(refundId: string, userId: string): Promise<void> {
    try {
      const sqlString: string =
        "DELETE FROM refunds WHERE id=$1 AND user_id=$2";

      await this.db.query(sqlString, [refundId, userId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
