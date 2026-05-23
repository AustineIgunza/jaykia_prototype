import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type {
  createFeedbackDTO,
  Feedback,
  FeedbackRepository,
  updateFeedbackDTO,
} from "./feedback.types.js";

export class FeedbackRepo implements FeedbackRepository {
  constructor(private db: Database) {}

  async createFeedback(
    userId: string,
    feedbackDetails: createFeedbackDTO,
  ): Promise<Feedback> {
    try {
      const sqlString: string =
          "INSERT INTO feedback(user_id,feedback_type,feedback) VALUES($1,$2,$3)",
        sqlQuery: QueryResult<Feedback> = await this.db.query(sqlString, [
          userId,
          feedbackDetails.feedback_type,
          feedbackDetails.feedback,
        ]),
        sqlResult = sqlQuery.rows[0];

      return sqlResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editFeedback(
    newFeedbackDetails: updateFeedbackDTO,
    feedbackId: string,
    userId: string,
  ): Promise<Feedback> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 3;

      for (let [key, value] of Object.entries(newFeedbackDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlQuery: string = `UPDATE feedback SET ${keys.join(",")} WHERE id=$1 AND user_id=$2`,
        editQuery: QueryResult<Feedback> = await this.db.query(sqlQuery, [
          feedbackId,
          userId,
          ...values,
        ]),
        editResult = editQuery.rows[0];

      return editResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getAllFeedback(): Promise<Feedback[]> {
    try {
      let sqlString: string = `SELECT * FROM feedback`,
        sqlQuery: QueryResult<Feedback> = await this.db.query(sqlString),
        allFeedbackRows = sqlQuery.rows;

      return allFeedbackRows;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    try {
      let sqlString: string = `SELECT * FROM feedback WHERE user_id=$1`,
        sqlQuery: QueryResult<Feedback> = await this.db.query(sqlString, [
          userId,
        ]),
        userFeedbackRows = sqlQuery.rows;

      return userFeedbackRows;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getFeedback(feedbackId: string): Promise<Feedback> {
    try {
      let sqlString: string = `SELECT * FROM feedback WHERE id=$1`,
        sqlQuery: QueryResult<Feedback> = await this.db.query(sqlString, [
          feedbackId,
        ]),
        feedbackRows = sqlQuery.rows;

      return feedbackRows[0]!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string, userId: string): Promise<void> {
    try {
      let sqlString: string = `DELETE FROM feedback WHERE id=$1 user_id=$2`;

      await this.db.query(sqlString, [feedbackId, userId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
