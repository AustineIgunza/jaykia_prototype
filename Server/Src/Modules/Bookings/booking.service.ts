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
      console.log(filteredBookingDetails);
      for (let [key, value] of Object.entries(bookingDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        filteredBookingDetails[key] = value;
      }

      const createBookingQuery = await this.bookingRepo.createBooking(
        userId,
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
    bookingId: string,
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
        "trip_status",
        "arrival_time",
        "cancelled",
        "cancelled_at",
        "reason",
        "payment_amount",
      ];

      let newFilteredBookingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(newBookingDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        newFilteredBookingDetails[key] = value;
      }

      const editBookingQuery = await this.bookingRepo.editBooking(
        userId,
        bookingId,
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
  async getAllBookings(): Promise<Booking[]> {
    try {
      const allBookings = await this.bookingRepo.getAllBookings();

      return allBookings;
    } catch (error) {
      Warning("Error at retrieving all bookings");
      throw error;
    }
  }
  async deleteBooking(bookingId: string, userId: string): Promise<void> {
    try {
      await this.bookingRepo.deleteBooking(bookingId, userId);
    } catch (error) {
      Warning(`Error at deleting booking`);
      throw error;
    }
  }
}
