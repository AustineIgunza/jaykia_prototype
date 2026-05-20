import type { IncomingMessage } from "http";
import { Warning } from "../../Utilities/Logger.js";
import { decode_access_token } from "../../Utilities/jwt.js";
import type { PublicUserDTO } from "../Modules/Users/user.types.js";

export type AuthInfo = {
  success: boolean;
  error: string;
  userId: string;
};

export const AuthValidator = (request: IncomingMessage): AuthInfo => {
  const { authorization } = request.headers;

  if (!authorization)
    return {
      success: false,
      error: "not provided",
      userId: "",
    };

  try {
    const userAuthToken = authorization.split(" ")[1];
    if (!userAuthToken)
      return { success: false, error: "not provided", userId: "" };

    const userDetails = decode_access_token(userAuthToken);

    return {
      success: true,
      error: "invalid",
      userId: (userDetails as PublicUserDTO).id,
    };
  } catch (error) {
    Warning("Error at authenticating user");
    throw error;
  }
};
