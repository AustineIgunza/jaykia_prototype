// ─── Real HTTP API client ───
// Requests go to /api/* on the same origin (Next.js proxy route
// forwards them to the backend at BACKEND_URL, unwraps the response
// envelope, and translates auth cookie → JSON body).

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
  PaystackInitiateDTO,
  PaystackInitiateResponse,
  InitiatePaymentResponse,
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
  PaymentMethod,
} from "./types";
import { getAccessToken } from "@/lib/auth/token";

// ─── Field translation helpers ──────────────────────────────────────────────

function bookingToBackend(
  data: Partial<CreateBookingDTO & UpdateBookingDTO>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    switch (k) {
      case "drop_off_location":
        out["dropoff_location"] = v;
        break;
      case "flight_departure":
        out["departure_time"] = v;
        break;
      case "flight_arrival":
        out["arrival_time"] = v;
        break;
      case "contact_name":
      case "contact_phone":
      case "contact_email":
      case "child_seat":
      case "notes":
        break;
      default:
        out[k] = v;
    }
  }
  return out;
}

function bookingFromBackend(raw: Record<string, unknown>): Booking {
  const {
    dropoff_location,
    departure_time,
    arrival_time,
    payment_amount: _pa,
    ...rest
  } = raw;
  return {
    ...rest,
    drop_off_location: (dropoff_location as string) ?? "",
    flight_departure: (departure_time as string) ?? null,
    flight_arrival: (arrival_time as string) ?? null,
  } as Booking;
}

function bookingsFromBackend(raw: unknown): Booking[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((b) => bookingFromBackend(b as Record<string, unknown>));
}

function paymentMethodFromBackend(m: string): PaymentMethod {
  if (m === "mpesa") return "m-pesa";
  if (m === "bank" || m === "paystack") return "paystack";
  return m as PaymentMethod;
}

function paymentFromBackend(raw: Record<string, unknown>): Payment {
  return {
    ...raw,
    payment_method: paymentMethodFromBackend(
      raw.payment_method as string
    ),
  } as Payment;
}

function paymentsFromBackend(raw: unknown): Payment[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => paymentFromBackend(p as Record<string, unknown>));
}

// ─── HTTP helper ────────────────────────────────────────────────────────────

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

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      (data as Record<string, string>).error || `Request failed: ${res.status}`
    );
  }
  return data as T;
}

// ─── Client implementation ──────────────────────────────────────────────────

export const realClient: ApiClient = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  register: (details: LegacySignupDetails) =>
    request<AuthResponse>("/api/auth/register/legacy", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  login: (details: LegacyLoginDetails) =>
    request<AuthResponse>("/api/auth/login/legacy", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  refreshToken: (refreshToken: string) =>
    request<AuthRefreshToken>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  // ── 2FA (not implemented on backend — stubs) ────────────────────────────

  setup2FA: (): Promise<TwoFactorSetupResponse> =>
    Promise.reject(new Error("2FA is not available on this server")),

  verifySetup2FA: (_code: string): Promise<TwoFactorVerifySetupResponse> =>
    Promise.reject(new Error("2FA is not available on this server")),

  verify2FA: (_tempToken: string, _code: string): Promise<AuthResponse> =>
    Promise.reject(new Error("2FA is not available on this server")),

  disable2FA: (_code: string): Promise<void> =>
    Promise.reject(new Error("2FA is not available on this server")),

  // ── Users ────────────────────────────────────────────────────────────────

  getUsers: () => request<PublicUserDTO[]>("/api/users/all"),

  getUser: (_userId: string) => request<PublicUserDTO>("/api/users"),

  createUser: (_data: CreateUserDTO): Promise<PublicUserDTO> =>
    Promise.reject(new Error("Use register instead")),

  updateUser: (_userId: string, data: UpdateUserDTO) =>
    request<PublicUserDTO>("/api/users", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteUser: (_userId: string) =>
    request<void>("/api/users", { method: "DELETE" }),

  // ── Roles ────────────────────────────────────────────────────────────────

  getRoles: () => request<Role[]>("/api/roles"),

  createRole: (data: CreateRoleDTO) =>
    request<Role>("/api/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRole: (roleId: number, data: UpdateRoleDTO) =>
    request<Role>("/api/roles", {
      method: "PATCH",
      body: JSON.stringify({ id: roleId, ...data }),
    }),

  deleteRole: (roleId: number) =>
    request<void>("/api/roles", {
      method: "DELETE",
      body: JSON.stringify({ id: roleId }),
    }),

  // ── User Roles ───────────────────────────────────────────────────────────

  getUserRoles: (_userId: string) =>
    request<UserSpecificRoles>("/api/userroles"),

  assignRole: (_userId: string, roleId: number) =>
    request<void>(`/api/userroles/${roleId}`, { method: "POST" }),

  removeRole: (_userId: string, roleId: number) =>
    request<void>(`/api/userroles/${roleId}`, { method: "DELETE" }),

  // ── Permissions ──────────────────────────────────────────────────────────

  getPermissions: () => request<Permission[]>("/api/permissions"),

  getUserPermissions: (_userId: string) =>
    request<UserPermission[]>("/api/userroles/permissions").then(
      (data: unknown) => {
        const rolesData = data as {
          userId: string;
          roles: {
            permissions: {
              permissionId: string;
              name: string;
              description: string | null;
            }[];
          }[];
        };
        if (!rolesData?.roles) return [];
        const perms: UserPermission[] = [];
        for (const role of rolesData.roles) {
          for (const p of role.permissions || []) {
            perms.push({
              id: p.permissionId,
              user_id: rolesData.userId,
              permission_id: Number(p.permissionId),
              created_at: "",
            });
          }
        }
        return perms;
      }
    ),

  assignPermission: (_userId: string, permissionId: number) =>
    request<void>("/api/rolepermissions", {
      method: "POST",
      body: JSON.stringify({ permission_id: permissionId }),
    }),

  removePermission: (_userId: string, permissionId: number) =>
    request<void>("/api/rolepermissions", {
      method: "DELETE",
      body: JSON.stringify({ id: permissionId }),
    }),

  // ── Bookings ─────────────────────────────────────────────────────────────

  getBookings: () =>
    request<unknown>("/api/bookings").then(bookingsFromBackend),

  getAllBookings: () =>
    request<unknown>("/api/bookings/all").then(bookingsFromBackend),

  getBooking: async (bookingId: string) => {
    const all = await request<unknown>("/api/bookings");
    const bookings = bookingsFromBackend(all);
    const found = bookings.find((b) => b.id === bookingId);
    if (!found) throw new Error("Booking not found");
    return found;
  },

  getMyBookings: () =>
    request<unknown>("/api/bookings").then(bookingsFromBackend),

  createBooking: (data: CreateBookingDTO) =>
    request<Record<string, unknown>>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingToBackend(data)),
    }).then(bookingFromBackend),

  updateBooking: (bookingId: string, data: UpdateBookingDTO) =>
    request<Record<string, unknown>>(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(bookingToBackend(data)),
    }).then(bookingFromBackend),

  // ── Payments ─────────────────────────────────────────────────────────────

  getPayments: () =>
    request<unknown>("/api/payments").then(paymentsFromBackend),

  getAllPayments: () =>
    request<unknown>("/api/payments/all").then(paymentsFromBackend),

  getPayment: (paymentId: string) =>
    request<Record<string, unknown>>(`/api/payments/${paymentId}`).then(
      paymentFromBackend
    ),

  initiateMpesa: (
    bookingId: string,
    amount: number,
    phoneNumber: string
  ) =>
    request<InitiatePaymentResponse>("/api/payments/mpesa/initiate", {
      method: "POST",
      body: JSON.stringify({
        booking_id: bookingId,
        amount,
        phone_number: phoneNumber,
      }),
    }),

  // Backend currently exposes Stripe + M-Pesa only. Paystack endpoint does not
  // exist server-side yet; stub here to avoid 404s. UI keeps Paystack branding.
  initiatePaystack: (_data: PaystackInitiateDTO): Promise<PaystackInitiateResponse> =>
    Promise.reject(new Error("Paystack is not available on this server")),

  deletePayment: (paymentId: string) =>
    request<void>(`/api/payments/${paymentId}`, { method: "DELETE" }),

  // ── Ratings ──────────────────────────────────────────────────────────────

  getRatings: () => request<Rating[]>("/api/ratings/all"),

  getAllRatings: () => request<Rating[]>("/api/ratings/all"),

  createRating: (data: CreateRatingDTO) => {
    const { booking_id, ...rest } = data;
    return request<Rating>(`/api/ratings/${booking_id}`, {
      method: "POST",
      body: JSON.stringify(rest),
    });
  },

  // ── Refunds ──────────────────────────────────────────────────────────────

  getRefunds: () => request<Refund[]>("/api/refunds"),

  getAllRefunds: () => request<Refund[]>("/api/refunds/all"),

  createRefund: (data: CreateRefundDTO) => {
    const { booking_id, ...rest } = data;
    return request<Refund>(`/api/refunds/${booking_id}`, {
      method: "POST",
      body: JSON.stringify(rest),
    });
  },

  updateRefund: (refundId: string, data: UpdateRefundDTO) =>
    request<Refund>(`/api/refunds/${refundId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // ── Feedback ─────────────────────────────────────────────────────────────

  getFeedback: () => request<Feedback[]>("/api/feedback"),

  getAllFeedback: () => request<Feedback[]>("/api/feedback/all"),

  createFeedback: (data: CreateFeedbackDTO) =>
    request<Feedback>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ── Analytics (not implemented on backend — stubs) ───────────────────────

  getAnalytics: (): Promise<Analytic[]> => Promise.resolve([]),

  getDashboardSummary: (): Promise<DashboardSummary> =>
    Promise.resolve({
      tripsCompleted: 0,
      clientsServed: 0,
      revenue: 0,
      repeatClients: 0,
    }),

  getMonthlyReports: (): Promise<MonthlyReport[]> => Promise.resolve([]),
};
