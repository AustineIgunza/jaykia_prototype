"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  setTokens,
  clearTokens,
  parseJwtPayload,
} from "./token";
import { getApiClient } from "@/lib/api/client";
import type { AuthResponse, LegacyLoginDetails, LegacySignupDetails } from "@/lib/api/types";

interface User {
  id: string;
  roles: string[];
}

export class TwoFactorRequiredError extends Error {
  tempToken: string;
  constructor(tempToken: string) {
    super("Two-factor authentication required");
    this.name = "TwoFactorRequiredError";
    this.tempToken = tempToken;
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (details: LegacyLoginDetails) => Promise<User>;
  register: (details: LegacySignupDetails) => Promise<User>;
  verify2FA: (tempToken: string, code: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from stored token on mount
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const token = getAccessToken();
      if (!token) return;

      const payload = parseJwtPayload(token);
      const userId =
        (payload?.id as string) ?? (payload?.userId as string) ?? null;
      if (!userId) {
        clearTokens();
        return;
      }

      try {
        const api = await getApiClient();
        const data = await api.getUserRoles(userId);
        if (!cancelled) {
          setUser({ id: userId, roles: data.roles });
        }
      } catch {
        clearTokens();
      }
    }

    hydrate().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const handleAuthResponse = useCallback(async (res: AuthResponse): Promise<User> => {
    setTokens(res.accessToken, res.refreshToken);
    const payload = parseJwtPayload(res.accessToken);
    const userId =
      (payload?.id as string) ?? (payload?.userId as string) ?? "unknown";
    const api = await getApiClient();
    const rolesData = await api.getUserRoles(userId);
    const newUser: User = { id: userId, roles: rolesData.roles };
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(
    async (details: LegacyLoginDetails): Promise<User> => {
      const api = await getApiClient();
      const res = await api.login(details);
      if (res.requiresTwoFactor && res.tempToken) {
        throw new TwoFactorRequiredError(res.tempToken);
      }
      return handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (details: LegacySignupDetails): Promise<User> => {
      const api = await getApiClient();
      const res = await api.register(details);
      return handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const verify2FA = useCallback(
    async (tempToken: string, code: string): Promise<User> => {
      const api = await getApiClient();
      const res = await api.verify2FA(tempToken, code);
      return handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isAdmin = user?.roles.includes("admin") ?? false;

  return (
    <AuthContext value={{ user, loading, login, register, verify2FA, logout, isAdmin }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
