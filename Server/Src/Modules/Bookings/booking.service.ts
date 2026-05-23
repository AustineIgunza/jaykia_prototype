import { Warning } from "../../../Utilities/Logger.js";
import type {
  Booking,
  BookingRepository,
  BookingService,
  createBookingDTO,
  updateBookingDTO,
} from "./booking.types.js";

export class BookingServ implements BookingService {
  constructor(private bookingRepo: BookingRepository) {}

  async createBooking(
    userId: string,
    bookingDetails: createBookingDTO,
  ): Promise<Booking> {
    try {
      if (!userId || !bookingDetails)
        throw new Error("User id and booking details must be provided");

      const allowedFields: string[] = [
        "pickup_location",
        "dropoff_location",
        "no_of_passengers",
        "no_of_luggage_items",
        "mode_of_transport",
        "flight_number",
        "departure_time",
        "arrival_time",
      ];

      let filteredBookingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(bookingDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        filteredBookingDetails[key] = value;
      }

      filteredBookingDetails["user_id"] = userId;

      const createBookingQuery = await this.bookingRepo.createBooking(
        filteredBookingDetails as createBookingDTO,
      );

      return createBookingQuery;
    } catch (error) {
      Warning(`Error at creating user bookings`);
      throw error;
    }
  }
  async editBooking(
    userId: string,
    newBookingDetails: updateBookingDTO,
  ): Promise<Booking> {
    try {
      if (!userId || !newBookingDetails)
        throw new Error("User id and booking details must be provided");

      const allowedFields: string[] = [
        "pickup_location",
        "dropoff_location",
        "no_of_passengers",
        "no_of_luggage_items",
        "mode_of_transport",
        "flight_number",
        "departure_time",
        "arrival_time",
        "id",
        "cancelled",
        "cancelled_at",
        "reason",
      ];

      let newFilteredBookingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(newBookingDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        newFilteredBookingDetails[key] = value;
      }

      newFilteredBookingDetails["user_id"] = userId;

      const editBookingQuery = await this.bookingRepo.editBooking(
        newFilteredBookingDetails as updateBookingDTO,
      );

      return editBookingQuery;
    } catch (error) {
      Warning(`Error at retrieving editing booking`);
      throw error;
    }
  }
  async getBooking(userId: string, bookingId: string): Promise<Booking> {
    try {
      if (!userId || !bookingId)
        throw new Error("User id and booking id must be provided");

      const retrieveBooking = await this.bookingRepo.getBooking(
        userId,
        bookingId,
      );

      return retrieveBooking;
    } catch (error) {
      Warning(`Error at retrieving booking`);
      throw error;
    }
  }
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      if (!userId) throw new Error("User id and booking id must be provided");

      const retrieveUserBooking =
        await this.bookingRepo.getUserBookings(userId);

      return retrieveUserBooking;
    } catch (error) {
      Warning(`Error at retrieving user bookings`);
      throw error;
    }
  }
  async deleteBooking(userId: string, bookingId: string): Promise<void> {
    try {
      await this.bookingRepo.deleteBooking(userId, bookingId);
    } catch (error) {
      Warning(`Error at deleting booking`);
      throw error;
    }
  }
}
