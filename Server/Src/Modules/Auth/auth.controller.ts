import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { AuthRepo } from "./auth.repository.js";
import { AuthServ } from "./auth.service.js";
import {
  getRequestBody,
  sendErrorMessage,
} from "../../../Utilities/HttpFunctions.js";
import { ErrorMsg } from "../../../Utilities/Logger.js";

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
        if (request.method != "POST") {
          sendErrorMessage(405, "Use POST instead", response);
          break;
        }
        const parsedReqBody: any = getRequestBody(request);

        if (pathNames[3] == "legacy") {
          const accountCreation = await authService.registerUser(
            "legacy",
            parsedReqBody,
          );

          response.writeHead(201);
        }
        if (pathNames[3] == "oauth") {
          if (pathNames[4] == "google") {
          }
        }
        break;
      case "login":
        if (pathNames[3] == "legacy") {
        }
        if (pathNames[3] == "oauth") {
          if (pathNames[4] == "google") {
          }
        }
        break;
      case "refresh":
        const newUserToken = await authService.refreshAccessToken(
          parsedReqBody.refreshToken,
        );

        response.writeHead(201, {
          "set-cookie": `token=${JSON.stringify(newUserToken)}; HttpOnly; SameSite=Lax; Path=/`,
          "content-type": "application/json",
        });
        response.end();
        break;
      case "retreive":
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
