// ─── API Client Interface ───
// Adapter pattern: real (HTTP) and mock implementations behind one interface.
// Switched via NEXT_PUBLIC_USE_MOCKS env var (defaults to "true").

import type {
  PublicUserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  LegacySignupDetails,
  LegacyLoginDetails,
  AuthResponse,
  AuthRefreshToken,
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  UserSpecificRoles,
  Permission,
  Booking,
  CreateBookingDTO,
  UpdateBookingDTO,
  Payment,
  CreatePaymentDTO,
  Rating,
  CreateRatingDTO,
  Refund,
  CreateRefundDTO,
  UpdateRefundDTO,
  Feedback,
  CreateFeedbackDTO,
  Analytic,
  DashboardSummary,
  MonthlyReport,
  UserPermission,
} from "./types";

export interface ApiClient {
  // Auth
  register(details: LegacySignupDetails): Promise<AuthResponse>;
  login(details: LegacyLoginDetails): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthRefreshToken>;

  // Users
  getUsers(): Promise<PublicUserDTO[]>;
  getUser(userId: string): Promise<PublicUserDTO>;
  createUser(data: CreateUserDTO): Promise<PublicUserDTO>;
  updateUser(userId: string, data: UpdateUserDTO): Promise<PublicUserDTO>;
  deleteUser(userId: string): Promise<void>;

  // Roles
  getRoles(): Promise<Role[]>;
  createRole(data: CreateRoleDTO): Promise<Role>;
  updateRole(roleId: number, data: UpdateRoleDTO): Promise<Role>;
  deleteRole(roleId: number): Promise<void>;

  // User Roles
  getUserRoles(userId: string): Promise<UserSpecificRoles>;
  assignRole(userId: string, roleId: number): Promise<void>;
  removeRole(userId: string, roleId: number): Promise<void>;

  // Permissions
  getPermissions(): Promise<Permission[]>;
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  assignPermission(userId: string, permissionId: number): Promise<void>;
  removePermission(userId: string, permissionId: number): Promise<void>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(bookingId: string): Promise<Booking>;
  getMyBookings(): Promise<Booking[]>;
  createBooking(data: CreateBookingDTO): Promise<Booking>;
  updateBooking(bookingId: string, data: UpdateBookingDTO): Promise<Booking>;

  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(paymentId: string): Promise<Payment>;
  createPayment(data: CreatePaymentDTO): Promise<Payment>;

  // Ratings
  getRatings(): Promise<Rating[]>;
  createRating(data: CreateRatingDTO): Promise<Rating>;

  // Refunds
  getRefunds(): Promise<Refund[]>;
  createRefund(data: CreateRefundDTO): Promise<Refund>;
  updateRefund(refundId: string, data: UpdateRefundDTO): Promise<Refund>;

  // Feedback
  getFeedback(): Promise<Feedback[]>;
  createFeedback(data: CreateFeedbackDTO): Promise<Feedback>;

  // Analytics
  getAnalytics(): Promise<Analytic[]>;
  getDashboardSummary(): Promise<DashboardSummary>;
  getMonthlyReports(): Promise<MonthlyReport[]>;
}

// Singleton — lazily initialized
let _client: ApiClient | null = null;

export async function getApiClient(): Promise<ApiClient> {
  if (_client) return _client;

  const useMocks =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_USE_MOCKS !== "false"
      : process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

  if (useMocks) {
    const { mockClient } = await import("./mock");
    _client = mockClient;
  } else {
    const { realClient } = await import("./real");
    _client = realClient;
  }

  return _client;
}
