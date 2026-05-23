import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type {
  createRatingDTO,
  Rating,
  RatingRepository,
  updateRatingDTO,
} from "./rating.types.js";

export class RatingRepo implements RatingRepository {
  constructor(private db: Database) {}

  async createRating(
    userId: string,
    ratingDetails: createRatingDTO,
  ): Promise<Rating> {
    try {
      let sqlString: string, sqlQuery: QueryResult<Rating>;

      if (ratingDetails.comments && ratingDetails.comments.length > 0) {
        sqlString = `INSERT INTO ratings(user_id,booking_id,rating,comments) VALUES($1,$2,$3,$4)`;
        sqlQuery = await this.db.query(sqlString, [
          userId,
          ratingDetails.booking_id,
          ratingDetails.rating,
          ratingDetails.comments,
        ]);
      } else {
        sqlString = `INSERT INTO ratings(user_id,booking_id,rating) VALUES($1,$2,$3)`;
        sqlQuery = await this.db.query(sqlString, [
          userId,
          ratingDetails.booking_id,
          ratingDetails.rating,
        ]);
      }

      let createdRating: Rating = sqlQuery.rows[0]!;

      return createdRating;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editRating(
    userId: string,
    ratingId: string,
    ratingDetails: updateRatingDTO,
  ): Promise<Rating> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 3;

      for (let [key, value] of Object.entries(ratingDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlQuery: string = `UPDATE ratings SET ${keys.join(",")} WHERE id=$1 and user_id=$2`,
        editQuery: QueryResult<Rating> = await this.db.query(sqlQuery, [
          ratingId,
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

  async getAllRating(): Promise<Rating[]> {
    try {
      const sqlString = "SELECT * FROM ratings",
        sqlQuery: QueryResult<Rating> = await this.db.query(sqlString),
        selectResult = sqlQuery.rows;

      return selectResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserRating(userId: string): Promise<Rating[]> {
    try {
      const sqlString = "SELECT * FROM ratings WHERE user_id=$1",
        sqlQuery: QueryResult<Rating> = await this.db.query(sqlString, [
          userId,
        ]),
        selectUserResult = sqlQuery.rows;

      return selectUserResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getRating(ratingId: string): Promise<Rating> {
    try {
      const sqlString = "SELECT * FROM ratings WHERE id=$1",
        sqlQuery: QueryResult<Rating> = await this.db.query(sqlString, [
          ratingId,
        ]),
        selectRating = sqlQuery.rows[0]!;

      return selectRating;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteRating(ratingId: string, userId: string): Promise<void> {
    try {
      const sqlString = "DELETE FROM ratings WHERE id=$1 and user_id=$2";

      await this.db.query(sqlString, [ratingId, userId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
