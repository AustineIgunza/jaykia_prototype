import type { Database } from "../../Config/DB.js";
import https from "https";
import type { IncomingMessage, ServerResponse } from "http";
import { AuthRepo } from "./auth.repository.js";
import { AuthServ } from "./auth.service.js";
import {
  getRequestBody,
  sendAuthMessage,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_SIGNUP_REDIRECT_URI,
  GOOGLE_LOGIN_REDIRECT_URI,
} from "./../../Config/Env.js";
import type {
  LegacyLoginDetails,
  OAuthLoginDetails,
  OAuthSignupDetails,
} from "./auth.types.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { UserRepo } from "../Users/user.repository.js";
import { UserServ } from "../Users/user.service.js";

export const AuthController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const authRepo = new AuthRepo(database),
    authService = new AuthServ(authRepo);

  try {
    switch (pathNames[2]) {
      case "register":
        const registrationDetails: any = await getRequestBody(request);
        console.log(registrationDetails);
        if (pathNames[3] == "legacy") {
          if (request.method != "POST") {
            sendErrorMessage(405, "Use POST instead", response);
            break;
          }
          const accountCreation = await authService.registerUser(
            "legacy",
            registrationDetails,
          );

          sendAuthMessage(201, accountCreation, response);
        } else if (pathNames[3] == "oauth") {
          if (pathNames[4] == "google") {
            if (pathNames[5] == "signup") {
              const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;

              response.writeHead(301, { location: authUrl });
              return response.end();
            } else if (pathNames[5] == "callback") {
              const googleCode = requestUrl.searchParams.get("code");

              const postData = new URLSearchParams({
                code: googleCode!,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI!,
                grant_type: "authorization_code",
              }).toString();

              const googleTokenRequest = https.request(
                "https://oauth2.googleapis.com/token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(postData),
                  },
                },
                (tokenRes: IncomingMessage) => {
                  let body = "";

                  tokenRes.on("data", (d) => (body += d));
                  tokenRes.on("end", async () => {
                    const tokens = JSON.parse(body);

                    if (tokens.id_token) {
                      const payload = JSON.parse(
                        Buffer.from(
                          tokens.id_token.split(".")[1],
                          "base64",
                        ).toString(),
                      );

                      const googleUserPayload: OAuthSignupDetails = {
                          username: payload.name,
                          email: payload.email,
                          profile_image: payload.picture,
                          oauth_provider: "google",
                        },
                        encryptedGoogleUser = await authService.registerUser(
                          "oauth",
                          googleUserPayload,
                        );

                      response.writeHead(302, {
                        location:
                          "http://localhost:3000/dashboard?oauth=google",
                        "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                      });
                      response.end();
                    }
                  });
                },
              );

              googleTokenRequest.write(postData);
              googleTokenRequest.end();
            }
          }
        } else sendErrorMessage(404, "Invalid auth route path", response);
        break;
      case "login":
        if (pathNames[3] == "legacy") {
          if (request.method != "POST") {
            sendErrorMessage(405, "Use POST instead", response);
            break;
          }

          const legacyPostDetails = await getRequestBody(request);

          const loginUser = await authService.loginUser(
            "legacy",
            legacyPostDetails as LegacyLoginDetails,
          );

          sendAuthMessage(200, loginUser, response);
        } else if (pathNames[3] == "oauth") {
          if (pathNames[4] == "google") {
            if (pathNames[5] == "login") {
              response.writeHead(301, {
                location: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`,
              });
              return response.end();
            } else if (pathNames[5] == "callback") {
              const googleCode = requestUrl.searchParams.get("code");

              const postData = new URLSearchParams({
                code: googleCode!,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: GOOGLE_LOGIN_REDIRECT_URI!,
                grant_type: "authorization_code",
              }).toString();

              const googleTokenRequest = https.request(
                "https://oauth2.googleapis.com/token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(postData),
                  },
                },
                (tokenRes: IncomingMessage) => {
                  let body = "";

                  tokenRes.on("data", (d) => (body += d));
                  tokenRes.on("end", async () => {
                    const tokens = JSON.parse(body);

                    if (tokens.id_token) {
                      const payload = JSON.parse(
                        Buffer.from(
                          tokens.id_token.split(".")[1],
                          "base64",
                        ).toString(),
                      );

                      const googleUserPayload: OAuthLoginDetails = {
                          username: payload.name,
                          email: payload.email,
                          profile_image: payload.picture,
                          oauth_provider: "google",
                        },
                        encryptedGoogleUser = await authService.loginUser(
                          "oauth",
                          googleUserPayload,
                        );

                      response.writeHead(302, {
                        location:
                          "http://localhost:3000/dashboard?oauth=google",
                        "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                      });
                      response.end();
                    }
                  });
                },
              );

              googleTokenRequest.write(postData);
              googleTokenRequest.end();
            }
          }
        } else sendErrorMessage(404, "Invalid auth route path", response);

        break;
      case "refresh":
        if (request.method != "POST") {
          sendErrorMessage(405, "Use POST instead", response);
          break;
        }

        const userRefreshToken: any = await getRequestBody(request);

        const newUserToken = await authService.refreshAccessToken(
          userRefreshToken.refreshToken,
        );

        sendAuthMessage(201, newUserToken, response);
        break;
      case "retrieve":
        if (request.method != "GET") {
          sendErrorMessage(405, "Use GET instead", response);
          break;
        }

        const userObject = AuthValidator(request);

        if (!userObject.success) {
          sendErrorMessage(
            userObject.statusCode,
            userObject.errorMsg,
            response,
          );
        } else {
          const userRepo = new UserRepo(database),
            userService = new UserServ(userRepo);

          const getUser = await userService.getUser(userObject.userId);

          sendResponseMessage(200, getUser, response);
        }
        break;
      default:
        sendErrorMessage(404, "Invalid API route on auth", response);
        break;
    }
  } catch (error) {
    ErrorMsg(error as Error);
    sendErrorMessage(500, (error as Error).message, response);
  }
};
