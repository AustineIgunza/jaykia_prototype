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

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (details: LegacyLoginDetails) => Promise<void>;
  register: (details: LegacySignupDetails) => Promise<void>;
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
      if (!payload || typeof payload.userId !== "string") {
        clearTokens();
        return;
      }

      try {
        const api = await getApiClient();
        const data = await api.getUserRoles(payload.userId);
        if (!cancelled) {
          setUser({ id: payload.userId, roles: data.roles });
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

  const handleAuthResponse = useCallback(async (res: AuthResponse) => {
    setTokens(res.accessToken, res.refreshToken);
    const payload = parseJwtPayload(res.accessToken);
    const userId = (payload?.userId as string) || "unknown";
    const api = await getApiClient();
    const rolesData = await api.getUserRoles(userId);
    setUser({ id: userId, roles: rolesData.roles });
  }, []);

  const login = useCallback(
    async (details: LegacyLoginDetails) => {
      const api = await getApiClient();
      const res = await api.login(details);
      await handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (details: LegacySignupDetails) => {
      const api = await getApiClient();
      const res = await api.register(details);
      await handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isAdmin = user?.roles.includes("admin") ?? false;

  return (
    <AuthContext value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
