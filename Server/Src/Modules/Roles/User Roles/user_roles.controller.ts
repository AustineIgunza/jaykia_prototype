import type { IncomingMessage, ServerResponse } from "http";
import type { Database } from "../../../Config/DB.js";
import { UserRoleRepo } from "./user_roles.repository.js";
import { UserRolesServ } from "./user_roles.service.js";

export const UserRoleController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const userRoleRepo = new UserRoleRepo(database),
    userRoleService = new UserRolesServ(userRoleRepo);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    try {
      const parsedReqBody = JSON.parse(unparsedReqBody || "{}"),
        { userId, roleId } = parsedReqBody;

      switch (request.method) {
        case "GET":
          const userRoles = await userRoleService.getUserRoles(userId);

          response.writeHead(200);
          response.end(JSON.stringify(userRoles));
          break;
        case "POST":
          const createUserRole = await userRoleService.createUserRole(
            userId,
            roleId,
          );

          response.writeHead(201);
          response.end(JSON.stringify(createUserRole));
          break;
        case "DELETE":
          await userRoleService.deleteUserRole(userId, roleId);

          response.writeHead(204);
          response.end();
          break;
        default:
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http method, try again",
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
