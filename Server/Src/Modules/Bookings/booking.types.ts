export type Booking = {
  id: string;
  user_id: string;
  pickup_location: string;
  dropoff_location: string;
  no_of_passengers: number;
  no_of_luggage_items: number;
  mode_of_transport: "road" | "railway" | "flight";
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  trip_status: "complete" | "pending" | "ongoing";
  cancelled: boolean;
  cancelled_at: string;
  reason: string;
  payment_amount: number;
};

export type createBookingDTO = Omit<
  Booking,
  "id" | "cancelled" | "cancelled_at" | "reason" | "trip_status"
> &
  Pick<
    Booking,
    | "pickup_location"
    | "dropoff_location"
    | "no_of_luggage_items"
    | "no_of_passengers"
  > &
  Partial<Booking>;

export type updateBookingDTO = Omit<Booking, "id" | "user_id"> &
  Partial<Booking>;

export interface BookingRepository {
  createBooking: (
    userId: string,
    bookingDetails: createBookingDTO,
  ) => Promise<Booking>;
  editBooking: (
    userId: string,
    bookingId: string,
    newBookingDetails: updateBookingDTO,
  ) => Promise<Booking>;
  getBooking: (userId: string, bookingId: string) => Promise<Booking>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getAllBookings: () => Promise<Booking[]>;
  deleteBooking: (bookingId: string, userId: string) => Promise<void>;
}
export interface BookingService {
  createBooking: (
    userId: string,
    bookingDetails: createBookingDTO,
  ) => Promise<Booking>;
  editBooking: (
    userId: string,
    bookingId: string,
    newBookingDetails: updateBookingDTO,
  ) => Promise<Booking>;
  getBooking: (userId: string, bookingId: string) => Promise<Booking>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  deleteBooking: (userId: string, bookingId: string) => Promise<void>;
}
