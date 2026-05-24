// ─── Mock API client ───
// Returns realistic fake data. Enabled by default (NEXT_PUBLIC_USE_MOCKS !== "false").
// Simulates a small network delay for realistic UX testing.

import type { ApiClient } from "./client";
import type {
  PublicUserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  LegacySignupDetails,
  LegacyLoginDetails,
  AuthResponse,
  AuthRefreshToken,
  TwoFactorSetupResponse,
  TwoFactorVerifySetupResponse,
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
import {
  mockUsers,
  mockRoles,
  mockPermissions,
  mockBookings,
  mockPayments,
  mockRatings,
  mockRefunds,
  mockFeedback,
  mockAnalytics,
  mockDashboardSummary,
  mockMonthlyReports,
} from "./mock-data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// In-memory state for mock mutations
const users = [...mockUsers];
const bookings = [...mockBookings];
const payments = [...mockPayments];
const ratings = [...mockRatings];
const refunds = [...mockRefunds];
const feedback = [...mockFeedback];
const roles = [...mockRoles];

// Simulated logged-in user (set after login/register)
let currentUserId = "u-001";

// Mock 2FA state
const twoFactorEnabled = new Set<string>();

// Build a fake JWT-shaped token so parseJwtPayload can extract userId
function makeFakeToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ userId, exp: 9999999999 }));
  return `${header}.${payload}.mock`;
}

// Admin mock credentials: admin@jaykia.co.ke / any password
const ADMIN_EMAIL = "admin@jaykia.co.ke";

export const mockClient: ApiClient = {
  // Auth
  async register(details: LegacySignupDetails): Promise<AuthResponse> {
    await delay();
    const newUser: PublicUserDTO = {
      id: `u-${uid()}`,
      username: details.username,
      email: details.email,
      phone_number: "",
      profile_image: "",
      oauth: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    currentUserId = newUser.id;
    return { accessToken: makeFakeToken(newUser.id), refreshToken: `refresh_${uid()}` };
  },

  async login(details: LegacyLoginDetails): Promise<AuthResponse> {
    await delay();
    // admin@jaykia.co.ke → admin user, anything else → regular customer
    if (details.email.toLowerCase() === ADMIN_EMAIL) {
      currentUserId = "u-admin";
    } else {
      currentUserId = "u-001";
    }
    if (twoFactorEnabled.has(currentUserId)) {
      return {
        accessToken: "",
        refreshToken: "",
        requiresTwoFactor: true,
        tempToken: `temp_${makeFakeToken(currentUserId)}`,
      };
    }
    return { accessToken: makeFakeToken(currentUserId), refreshToken: `refresh_${uid()}` };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refreshToken(_refreshToken: string): Promise<AuthRefreshToken> {
    await delay();
    return { accessToken: makeFakeToken(currentUserId) };
  },

  // 2FA
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    await delay();
    return {
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/JayKia:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=JayKia`,
      secret: "JBSWY3DPEHPK3PXP",
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verifySetup2FA(_code: string): Promise<TwoFactorVerifySetupResponse> {
    await delay();
    twoFactorEnabled.add(currentUserId);
    return {
      backupCodes: [
        "A1B2-C3D4", "E5F6-G7H8", "J9K0-L1M2",
        "N3P4-Q5R6", "S7T8-U9V0", "W1X2-Y3Z4",
      ],
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verify2FA(tempToken: string, _code: string): Promise<AuthResponse> {
    await delay();
    // Extract userId from tempToken
    const realToken = tempToken.replace("temp_", "");
    const payload = JSON.parse(atob(realToken.split(".")[1]));
    currentUserId = payload.userId;
    return { accessToken: makeFakeToken(currentUserId), refreshToken: `refresh_${uid()}` };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disable2FA(_code: string): Promise<void> {
    await delay();
    twoFactorEnabled.delete(currentUserId);
  },

  // Users
  async getUsers(): Promise<PublicUserDTO[]> {
    await delay();
    return users.filter((u) => !u.deleted_at);
  },

  async getUser(userId: string): Promise<PublicUserDTO> {
    await delay();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    return user;
  },

  async createUser(data: CreateUserDTO): Promise<PublicUserDTO> {
    await delay();
    const newUser: PublicUserDTO = {
      id: `u-${uid()}`,
      username: data.username,
      email: data.email,
      phone_number: data.phone_number,
      profile_image: "",
      oauth: data.oauth ?? false,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  async updateUser(userId: string, data: UpdateUserDTO): Promise<PublicUserDTO> {
    await delay();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...data } as PublicUserDTO;
    return users[idx];
  },

  async deleteUser(userId: string): Promise<void> {
    await delay();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], deleted_at: new Date().toISOString() };
  },

  // Roles
  async getRoles(): Promise<Role[]> {
    await delay();
    return roles;
  },

  async createRole(data: CreateRoleDTO): Promise<Role> {
    await delay();
    const role: Role = { id: roles.length + 1, ...data };
    roles.push(role);
    return role;
  },

  async updateRole(roleId: number, data: UpdateRoleDTO): Promise<Role> {
    await delay();
    const idx = roles.findIndex((r) => r.id === roleId);
    if (idx === -1) throw new Error("Role not found");
    roles[idx] = { ...roles[idx], ...data } as Role;
    return roles[idx];
  },

  async deleteRole(roleId: number): Promise<void> {
    await delay();
    const idx = roles.findIndex((r) => r.id === roleId);
    if (idx !== -1) roles.splice(idx, 1);
  },

  // User Roles
  async getUserRoles(userId: string): Promise<UserSpecificRoles> {
    await delay();
    if (userId === "u-admin") return { userId, roles: ["admin"] };
    return { userId, roles: ["customer"] };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignRole(_userId: string, _roleId: number): Promise<void> {
    await delay();
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeRole(_userId: string, _roleId: number): Promise<void> {
    await delay();
  },

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    await delay();
    return mockPermissions;
  },

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    await delay();
    if (userId === "u-admin") {
      return mockPermissions.map((p) => ({
        id: `up-${p.id}`,
        user_id: userId,
        permission_id: p.id,
        created_at: "2025-10-01T00:00:00Z",
      }));
    }
    return [];
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignPermission(_userId: string, _permissionId: number): Promise<void> {
    await delay();
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removePermission(_userId: string, _permissionId: number): Promise<void> {
    await delay();
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    await delay();
    return bookings;
  },

  async getBooking(bookingId: string): Promise<Booking> {
    await delay();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");
    return booking;
  },

  async getMyBookings(): Promise<Booking[]> {
    await delay();
    return bookings.filter((b) => b.user_id === currentUserId);
  },

  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    await delay();
    const booking: Booking = {
      id: `b-${uid()}`,
      user_id: currentUserId,
      ...data,
      flight_number: data.flight_number ?? null,
      flight_departure: data.flight_departure ?? null,
      flight_arrival: data.flight_arrival ?? null,
      cancelled: false,
      cancelled_at: null,
      reason: "",
      trip_status: "pending",
      created_at: new Date().toISOString(),
    };
    bookings.push(booking);
    return booking;
  },

  async updateBooking(bookingId: string, data: UpdateBookingDTO): Promise<Booking> {
    await delay();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error("Booking not found");
    bookings[idx] = { ...bookings[idx], ...data } as Booking;
    return bookings[idx];
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    await delay();
    return payments;
  },

  async getPayment(paymentId: string): Promise<Payment> {
    await delay();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Payment not found");
    return payment;
  },

  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    await delay();
    const payment: Payment = {
      id: `p-${uid()}`,
      user_id: currentUserId,
      ...data,
      phone_number: data.phone_number ?? null,
      transaction_reference: data.transaction_reference ?? `TXN_${uid()}`,
      paid_at: new Date().toISOString(),
    };
    payments.push(payment);
    return payment;
  },

  // Ratings
  async getRatings(): Promise<Rating[]> {
    await delay();
    return ratings;
  },

  async createRating(data: CreateRatingDTO): Promise<Rating> {
    await delay();
    const rating: Rating = {
      id: `r-${uid()}`,
      user_id: currentUserId,
      ...data,
      comments: data.comments ?? null,
      created_at: new Date().toISOString(),
    };
    ratings.push(rating);
    return rating;
  },

  // Refunds
  async getRefunds(): Promise<Refund[]> {
    await delay();
    return refunds;
  },

  async createRefund(data: CreateRefundDTO): Promise<Refund> {
    await delay();
    const refund: Refund = {
      id: `rf-${uid()}`,
      user_id: currentUserId,
      ...data,
      approved: "pending",
      created_at: new Date().toISOString(),
      cancelled: false,
      cancelled_at: null,
    };
    refunds.push(refund);
    return refund;
  },

  async updateRefund(refundId: string, data: UpdateRefundDTO): Promise<Refund> {
    await delay();
    const idx = refunds.findIndex((r) => r.id === refundId);
    if (idx === -1) throw new Error("Refund not found");
    refunds[idx] = { ...refunds[idx], ...data } as Refund;
    return refunds[idx];
  },

  // Feedback
  async getFeedback(): Promise<Feedback[]> {
    await delay();
    return feedback;
  },

  async createFeedback(data: CreateFeedbackDTO): Promise<Feedback> {
    await delay();
    const fb: Feedback = {
      id: `f-${uid()}`,
      user_id: currentUserId,
      ...data,
      created_at: new Date().toISOString(),
    };
    feedback.push(fb);
    return fb;
  },

  // Analytics
  async getAnalytics(): Promise<Analytic[]> {
    await delay();
    return mockAnalytics;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay();
    return mockDashboardSummary;
  },

  async getMonthlyReports(): Promise<MonthlyReport[]> {
    await delay();
    return mockMonthlyReports;
  },
};
