import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { AuthRepo } from "./auth.repository.js";
import { AuthServ } from "./auth.service.js";

export const AuthController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const authRepo = new AuthRepo(database),
    authService = new AuthServ(authRepo);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    try {
      if (request.method != "POST") {
        response.writeHead(405);
        response.end(
          JSON.stringify({
            error: "Invalid HTTP method",
          }),
        );
        return;
      }

      const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

      switch (pathNames[2]) {
        case "register":
          if (pathNames[3] == "legacy") {
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
        default:
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error: "Invalid api route on auth",
            }),
          );
          break;
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
