import type { IncomingMessage, ServerResponse } from "http";
import type { Database } from "../../Config/DB.js";
import { UserRepo } from "./user.repository.js";
import { UserServ } from "./user.service.js";

export const UserController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const userRepo = new UserRepo(database),
    userService = new UserServ(userRepo);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    try {
      const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

      switch (request.method) {
        case "GET":
          if (pathNames[2] == "all") {
            const allUsers = await userService.getAllUsers();

            response.writeHead(200);
            response.end(JSON.stringify(allUsers));
          } else {
          }
          break;
        case "POST":
          break;
        case "PATCH":
          break;
        case "DELETE":
          break;
        default:
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
