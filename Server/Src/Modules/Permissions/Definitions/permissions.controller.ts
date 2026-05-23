import type { Database } from "../../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { PermissionRepo } from "./permissions.repository.js";
import { PermissionService } from "./permissions.service.js";
import type { Permission } from "./permissions.types.js";

export const PermissionController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    searchParams = requestUrl.searchParams;

  const permissionRepo = new PermissionRepo(database),
    permissionService = new PermissionService(permissionRepo);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    try {
      const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

      switch (request.method) {
        case "GET":
          const type = searchParams.get("type");

          if (!type) {
            response.writeHead(400, {
              "Content-type": "application/json",
            });
            response.end(
              JSON.stringify({
                error: "Search param, type not provided, specify all or one",
              }),
            );
            return;
          }

          let responseBody: any;

          if (type == "all")
            responseBody = await permissionService.getAllPermission();
          else {
            const permissionId = searchParams.get("permissionid");
            if (!permissionId) {
              response.writeHead(400, {
                "Content-type": "application/json",
              });
              response.end(
                JSON.stringify({
                  error: "Permission id not provided",
                }),
              );
              return;
            }

            responseBody = await permissionService.getPermission(permissionId);
          }

          response.writeHead(200, {
            "Content-type": "application/json",
          });
          response.end(JSON.stringify(responseBody));

          break;
        case "POST":
          const permissionCreation: Permission =
            await permissionService.createPermission(parsedReqBody);

          response.writeHead(201, {
            "Content-type": "application/json",
          });
          response.end(JSON.stringify(permissionCreation));

          break;
        case "PATCH":
          const permissionUpdate: Permission =
            await permissionService.editPermission(parsedReqBody);

          response.writeHead(200, {
            "Content-type": "application/json",
          });
          response.end(JSON.stringify(permissionUpdate));

          break;
        case "DELETE":
          const permissionId = searchParams.get("permissionid");
          if (!permissionId) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Search param not provided, permission id required",
              }),
            );
            return;
          }

          await permissionService.deletePermission(permissionId);

          response.writeHead(204);
          response.end();

          break;
        default:
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid HTTP header method",
            }),
          );

          break;
      }
    } catch (error) {
      if (!response.headersSent) {
        response.writeHead(500);
        response.end(
          JSON.stringify({
            error: (error as Error).message,
          }),
        );
      } else request.destroy();
    }
  });
};
