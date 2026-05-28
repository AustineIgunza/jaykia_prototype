// ─── Types mirrored from backend *.types.ts + SQL schema ───
// Where shapes are unclear, assumptions are marked with TODO comments.

// ─── Users ───

export interface CreateUserDTO {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  oauth?: boolean;
  oauth_provider?: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  profile_image?: string;
  flag?: boolean;
  flag_reason?: string;
  deleted_at?: string;
}

export interface PublicUserDTO {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  profile_image: string;
  oauth: boolean;
  deleted_at: string | null;
  created_at: string;
}

// ─── Auth ───

export interface LegacySignupDetails {
  username: string;
  email: string;
  password: string;
}

export interface OAuthSignupDetails {
  username: string;
  email: string;
  oauth_provider: string;
}

export interface LegacyLoginDetails {
  email: string;
  password: string;
}

export interface OAuthLoginDetails {
  email: string;
  oauth_provider: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface TwoFactorSetupResponse {
  qrCodeUrl: string;
  secret: string;
}

export interface TwoFactorVerifySetupResponse {
  backupCodes: string[];
}

export interface AuthRefreshToken {
  accessToken: string;
}

// ─── Roles ───

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface CreateRoleDTO {
  name: string;
  description: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}

// ─── User Roles ───

export interface UserRole {
  id: string;
  user_id: string;
  role_id: number;
  created_at: string;
}

export interface UserSpecificRoles {
  userId: string;
  roles: string[];
}

// ─── Permissions ───

export interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: number;
  created_at: string;
}

// ─── Bookings ───
// TODO: verify against backend — controllers are empty, shapes guessed from SQL

export type TransportMode = "road" | "railway" | "flight";
export type TripStatus = "complete" | "ongoing" | "pending";

export interface Booking {
  id: string;
  user_id: string;
  pickup_location: string;
  drop_off_location: string;
  no_of_passengers: number;
  no_of_luggage_items: number;
  mode_of_transport: TransportMode;
  flight_number: string | null;
  flight_departure: string | null;
  flight_arrival: string | null;
  cancelled: boolean;
  cancelled_at: string | null;
  reason: string;
  trip_status: TripStatus;
  // TODO: verify — these fields are in the business requirements but not in the SQL schema
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  child_seat?: boolean;
  notes?: string;
  created_at?: string;
}

export interface CreateBookingDTO {
  pickup_location: string;
  drop_off_location: string;
  no_of_passengers: number;
  no_of_luggage_items: number;
  mode_of_transport: TransportMode;
  flight_number?: string;
  flight_departure?: string;
  flight_arrival?: string;
  // TODO: verify against backend — extra fields from business requirements
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  child_seat?: boolean;
  notes?: string;
}

export interface UpdateBookingDTO {
  trip_status?: TripStatus;
  cancelled?: boolean;
  cancelled_at?: string;
  reason?: string;
  pickup_location?: string;
  drop_off_location?: string;
  no_of_passengers?: number;
  no_of_luggage_items?: number;
  mode_of_transport?: TransportMode;
  flight_number?: string;
  flight_arrival?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  child_seat?: boolean;
  notes?: string;
}

// ─── Payments ───
// Backend rewrote payments around Paystack. Routes:
//   POST /payments/initialize/payment  → one-shot transaction
//   POST /payments/initialize/invoice  → invoice
//   POST /payments/callback            → Paystack webhook
// No GET/DELETE on /payments at present.

export type PaymentMethod = "mobile" | "bank";
export type PaymentStatus = "paid" | "pending" | "failed";
export type QuoteType = "payment" | "invoice";

export interface Payment {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number | string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_reference: string | null;
  paid_at: string | null;
}

export interface PaystackInitiateDTO {
  bookingId: string;
  amount: number;
}

export interface PaystackInitiateResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackInvoiceResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    due_date: string;
    invoice_number: string;
    request_code: string;
    status: string;
    paid: boolean;
  };
}

// ─── Ratings ───

export interface Rating {
  id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comments: string | null;
  created_at: string;
}

export interface CreateRatingDTO {
  booking_id: string;
  rating: number;
  comments?: string;
}

// ─── Refunds ───

export type RefundApproval = "pending" | "accepted" | "rejected";

export interface Refund {
  id: string;
  user_id: string;
  booking_id: string;
  reason: string;
  approved: RefundApproval;
  created_at: string;
  cancelled: boolean;
  cancelled_at: string | null;
}

export interface CreateRefundDTO {
  booking_id: string;
  reason: string;
}

export interface UpdateRefundDTO {
  approved?: RefundApproval;
  cancelled?: boolean;
}

// ─── Feedback ───

export type FeedbackType = "comment" | "issue" | "critique";

export interface Feedback {
  id: string;
  user_id: string;
  feedback_type: FeedbackType;
  feedback: string;
  created_at: string;
}

export interface CreateFeedbackDTO {
  feedback_type: FeedbackType;
  feedback: string;
}

// ─── Analytics ───
// TODO: verify against backend — controllers are empty

export type AnalyticType = "users" | "sales";

export interface Analytic {
  id: string;
  analytics_type: AnalyticType;
  aggregate_number: number;
  created_at: string;
}

// ─── Dashboard summary (frontend-defined aggregate) ───

export interface DashboardSummary {
  tripsCompleted: number;
  clientsServed: number;
  revenue: number;
  repeatClients: number;
}

export interface MonthlyReport {
  month: string; // "2026-01", "2026-02", etc.
  tripsCompleted: number;
  clientsServed: number;
  revenue: number;
}

// ─── API error shape ───

export interface ApiError {
  error: string;
}

// ─── Pagination (guessed — backend doesn't implement yet) ───
// TODO: verify against backend

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
