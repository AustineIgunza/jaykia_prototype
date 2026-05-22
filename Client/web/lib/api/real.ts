// ─── Real HTTP API client ───
// Calls the actual backend at NEXT_PUBLIC_API_BASE_URL.

import type { ApiClient } from "./client";
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
import { getAccessToken } from "@/lib/auth/token";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export const realClient: ApiClient = {
  // Auth
  // TODO: verify against backend — auth routes not registered yet
  register: (details: LegacySignupDetails) =>
    request<AuthResponse>("/auth/register/legacy", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  login: (details: LegacyLoginDetails) =>
    request<AuthResponse>("/auth/login/legacy", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  refreshToken: (refreshToken: string) =>
    request<AuthRefreshToken>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  // Users
  getUsers: () => request<PublicUserDTO[]>("/users/all"),

  getUser: (userId: string) => request<PublicUserDTO>(`/users/${userId}`),

  createUser: (data: CreateUserDTO) =>
    request<PublicUserDTO>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUser: (userId: string, data: UpdateUserDTO) =>
    request<PublicUserDTO>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    request<void>(`/users/${userId}`, { method: "DELETE" }),

  // Roles
  getRoles: () => request<Role[]>("/roles"),

  createRole: (data: CreateRoleDTO) =>
    request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRole: (roleId: number, data: UpdateRoleDTO) =>
    request<Role>(`/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteRole: (roleId: number) =>
    request<void>(`/roles/${roleId}`, { method: "DELETE" }),

  // User Roles
  getUserRoles: (userId: string) =>
    request<UserSpecificRoles>("/userroles", {
      method: "GET",
      body: JSON.stringify({ userId }),
    }),

  assignRole: (userId: string, roleId: number) =>
    request<void>("/userroles", {
      method: "POST",
      body: JSON.stringify({ userId, roleId }),
    }),

  removeRole: (userId: string, roleId: number) =>
    request<void>("/userroles", {
      method: "DELETE",
      body: JSON.stringify({ userId, roleId }),
    }),

  // Permissions
  // TODO: verify against backend — controllers are empty
  getPermissions: () => request<Permission[]>("/permissions"),

  getUserPermissions: (userId: string) =>
    request<UserPermission[]>(`/userpermissions?userId=${userId}`),

  assignPermission: (userId: string, permissionId: number) =>
    request<void>("/userpermissions", {
      method: "POST",
      body: JSON.stringify({ userId, permissionId }),
    }),

  removePermission: (userId: string, permissionId: number) =>
    request<void>("/userpermissions", {
      method: "DELETE",
      body: JSON.stringify({ userId, permissionId }),
    }),

  // Bookings
  // TODO: verify against backend — controllers are empty
  getBookings: () => request<Booking[]>("/bookings"),

  getBooking: (bookingId: string) => request<Booking>(`/bookings/${bookingId}`),

  getMyBookings: () => request<Booking[]>("/bookings/mine"),

  createBooking: (data: CreateBookingDTO) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBooking: (bookingId: string, data: UpdateBookingDTO) =>
    request<Booking>(`/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Payments
  // TODO: verify against backend — controllers are empty
  getPayments: () => request<Payment[]>("/payments"),

  getPayment: (paymentId: string) => request<Payment>(`/payments/${paymentId}`),

  createPayment: (data: CreatePaymentDTO) =>
    request<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Ratings
  // TODO: verify against backend — controllers are empty
  getRatings: () => request<Rating[]>("/ratings"),

  createRating: (data: CreateRatingDTO) =>
    request<Rating>("/ratings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Refunds
  // TODO: verify against backend — controllers are empty
  getRefunds: () => request<Refund[]>("/refunds"),

  createRefund: (data: CreateRefundDTO) =>
    request<Refund>("/refunds", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRefund: (refundId: string, data: UpdateRefundDTO) =>
    request<Refund>(`/refunds/${refundId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Feedback
  // TODO: verify against backend — controllers are empty
  getFeedback: () => request<Feedback[]>("/feedback"),

  createFeedback: (data: CreateFeedbackDTO) =>
    request<Feedback>("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Analytics
  // TODO: verify against backend — controllers are empty
  getAnalytics: () => request<Analytic[]>("/analytics"),

  getDashboardSummary: () => request<DashboardSummary>("/analytics/summary"),

  getMonthlyReports: () => request<MonthlyReport[]>("/analytics/monthly"),
};
