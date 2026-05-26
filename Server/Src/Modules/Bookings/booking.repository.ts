import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type {
  Booking,
  BookingRepository,
  createBookingDTO,
  updateBookingDTO,
} from "./booking.types.js";

export class BookingRepo implements BookingRepository {
  constructor(private db: Database) {}

  async createBooking(
    userId: string,
    bookingDetails: createBookingDTO,
  ): Promise<Booking> {
    try {
      let sqlQuery: string;
      console.log(bookingDetails);
      if (bookingDetails.mode_of_transport == "flight")
        sqlQuery = `INSERT INTO booking(user_id,pickup_location,dropoff_location,no_of_passengers,no_of_luggage_items,mode_of_transport,flight_number,departure_time,arrival_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
      else
        sqlQuery = `INSERT INTO booking(user_id,pickup_location,dropoff_location,no_of_passengers,no_of_luggage_items,mode_of_transport,departure_time,arrival_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;

      const {
        pickup_location,
        dropoff_location,
        no_of_passengers,
        no_of_luggage_items,
        mode_of_transport,
        flight_number,
        departure_time,
        arrival_time,
      } = bookingDetails;

      const bookingQuery: QueryResult<Booking> = await this.db.query(
          sqlQuery,
          bookingDetails.mode_of_transport == "flight"
            ? [
                userId,
                pickup_location,
                dropoff_location,
                no_of_passengers,
                no_of_luggage_items,
                mode_of_transport,
                flight_number,
                departure_time,
                arrival_time,
              ]
            : [
                userId,
                pickup_location,
                dropoff_location,
                no_of_passengers,
                no_of_luggage_items,
                mode_of_transport,
                departure_time,
                arrival_time,
              ],
        ),
        bookingResult = bookingQuery.rows[0];

      return bookingResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editBooking(
    userId: string,
    bookingId: string,
    newBookingDetails: updateBookingDTO,
  ): Promise<Booking> {
    try {
      console.log(newBookingDetails);
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 3;

      for (let [key, value] of Object.entries(newBookingDetails)) {
        if (key == "user_id" || key == "id") continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlQuery = `UPDATE booking SET ${keys.join(",")} WHERE id=$1 AND user_id=$2 RETURNING *`;

      const updateQuery = await this.db.query(sqlQuery, [
          bookingId,
          userId,
          ...values,
        ]),
        updateResult = updateQuery.rows[0];

      return updateResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getBooking(userId: string, bookingId: string): Promise<Booking> {
    try {
      const sqlQuery = `SELECT * FROM booking WHERE id=$1 AND user_id=$2`,
        retrievalQuery = await this.db.query(sqlQuery, [bookingId, userId]),
        retrievalResult = retrievalQuery.rows[0];

      return retrievalResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const sqlQuery = `SELECT * FROM booking WHERE user_id=$1`,
        retrievalQuery = await this.db.query(sqlQuery, [userId]),
        retrievalResult = retrievalQuery.rows;

      return retrievalResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      const sqlQuery = `SELECT * FROM booking`,
        retrievalQuery = await this.db.query(sqlQuery),
        retrievalResult = retrievalQuery.rows;

      return retrievalResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteBooking(bookingId: string, userId: string): Promise<void> {
    try {
      const sqlQuery = `DELETE FROM booking WHERE id=$1 AND user_id=$2`;

      await this.db.query(sqlQuery, [bookingId, userId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
