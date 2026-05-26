import { Warning } from "../../../Utilities/Logger.js";
import type {
  AuthRefreshToken,
  AuthRepository,
  AuthResponse,
  AuthService,
  authType,
  LegacyLoginDetails,
  LegacySignupDetails,
  OAuthLoginDetails,
  OAuthSignupDetails,
} from "./auth.types.js";
import type { PublicUserDTO, User } from "../Users/user.types.js";
import {
  decode_refresh_token,
  encode_access_token,
  refresh_access_token,
} from "../../../Utilities/jwt.js";

export class AuthServ implements AuthService {
  constructor(private authRepo: AuthRepository) {}

  private createPublicUser(user: User): PublicUserDTO {
    console.log(user);
    const { flag, flag_reason, oauth_provider, password, ...publicUser } = user;
    return publicUser;
  }

  async registerUser(
    authType: authType,
    userDetails: LegacySignupDetails | OAuthSignupDetails,
  ): Promise<AuthResponse> {
    try {
      const allowedFields: string[] = [
        "username",
        "email",
        "password",
        "oauth_provider",
        "profile_image",
      ];
      let newUserDetails: Record<string, string> = {};

      for (let [key, value] of Object.entries(userDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.length <= 0)
          throw new Error(`${key} has an empty value`);

        newUserDetails[key] = value;
      }

      const newUser = await this.authRepo.registerUser(
          authType,
          newUserDetails as LegacySignupDetails | OAuthSignupDetails,
        ),
        publicUser = this.createPublicUser(newUser),
        publicUserTokens = encode_access_token(publicUser);

      return publicUserTokens;
    } catch (error) {
      Warning("Error at registering user");
      throw error;
    }
  }

  async loginUser(
    authType: authType,
    userDetails: LegacyLoginDetails | OAuthLoginDetails,
  ): Promise<AuthResponse> {
    try {
      const allowedFields: string[] = [
        "username",
        "email",
        "password",
        "oauth_provider",
      ];
      let newUserDetails: Record<string, string> = {};

      for (let [key, value] of Object.entries(userDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.length <= 0)
          throw new Error(`${key} has an empty value`);

        newUserDetails[key] = value;
      }

      const loginUser = await this.authRepo.loginUser(
          authType,
          newUserDetails as LegacySignupDetails | OAuthSignupDetails,
        ),
        publicUser = this.createPublicUser(loginUser),
        publicUserTokens = encode_access_token(publicUser);

      return publicUserTokens;
    } catch (error) {
      Warning("Error at logging in user");
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthRefreshToken> {
    try {
      if (!refreshToken) throw new Error("Refresh token not sufficient");

      const verifyRefreshToken = decode_refresh_token(refreshToken),
        refreshAToken = refresh_access_token(verifyRefreshToken);

      return refreshAToken;
    } catch (error) {
      Warning("Error at refreshing access token");
      throw error;
    }
  }
}
