import type { User } from "../Users/user.types.js";

export type LegacySignupDetails = {
  username: string;
  email: string;
  password: string;
  profile_image: string;
};
export type LegacyLoginDetails = Pick<LegacySignupDetails, "password"> &
  Omit<LegacySignupDetails, "username">;

export type OAuthSignupDetails = Omit<LegacySignupDetails, "password"> & {
  oauth_provider: string;
};
export type OAuthLoginDetails = OAuthSignupDetails & {
  oauth_provider: string;
};

export type authType = "legacy" | "oauth";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};
export type AuthRefreshToken = {
  accessToken: string;
};

export interface AuthRepository {
  registerUser: (
    authType: authType,
    userDetails: LegacySignupDetails | OAuthSignupDetails,
  ) => Promise<User>;
  loginUser: (
    authType: authType,
    userDetails: LegacyLoginDetails | OAuthLoginDetails,
  ) => Promise<User>;
}
export interface AuthService {
  registerUser: (
    authType: authType,
    userDetails: LegacySignupDetails | OAuthSignupDetails,
  ) => Promise<AuthResponse>;
  loginUser: (
    authType: authType,
    userDetails: LegacyLoginDetails | OAuthLoginDetails,
  ) => Promise<AuthResponse>;
  refreshAccessToken: (refreshToken: string) => Promise<AuthRefreshToken>;
}
