import type { Database } from "../../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { RoleRepo } from "./roles.repository.js";
import { Roleservice } from "./roles.service.js";

export const RoleController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
): void => {
  const roleRepo = new RoleRepo(database),
    roleService = new Roleservice(roleRepo);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

    try {
      switch (request.method) {
        case "GET":
          const retrieveRoles = await roleService.getRoles();

          response.writeHead(200);
          response.end(JSON.stringify({ response: retrieveRoles }));
          break;
        case "POST":
          const createRole = await roleService.createRole(parsedReqBody);

          response.writeHead(201);
          response.end(
            JSON.stringify({
              response: createRole,
            }),
          );
          break;
        case "PATCH":
          const updateRole = await roleService.editRole(
            parsedReqBody.id,
            parsedReqBody,
          );

          response.writeHead(200);
          response.end(
            JSON.stringify({
              response: updateRole,
            }),
          );
          break;
        case "DELETE":
          await roleService.deleteRole(parsedReqBody.id);

          response.writeHead(204);
          response.end();
          break;
        default:
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error: "Invalid http method",
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
