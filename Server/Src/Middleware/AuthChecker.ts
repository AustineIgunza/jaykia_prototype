import type { IncomingMessage } from "http";
import { Warning } from "../../Utilities/Logger.js";
import { decode_access_token } from "../../Utilities/jwt.js";
import type { PublicUserDTO } from "../Modules/Users/user.types.js";

export type AuthInfo = {
  success: boolean;
  errorMsg: string;
  userId: string;
  statusCode: number;
};

export const AuthValidator = (request: IncomingMessage): AuthInfo => {
  const { authorization } = request.headers;

  if (!authorization)
    return {
      success: false,
      errorMsg: "Auth token not provided",
      userId: "",
      statusCode: 401,
    };

  try {
    const userAuthToken = authorization.split(" ")[1];
    if (!userAuthToken)
      return {
        success: false,
        errorMsg: "not provided",
        userId: "",
        statusCode: 401,
      };

    const userDetails = decode_access_token(userAuthToken);

    return {
      success: true,
      errorMsg: "",
      userId: (userDetails as PublicUserDTO).id,
      statusCode: 200,
    };
  } catch (error) {
    Warning("Error at authenticating user");
    throw error;
  }
};
