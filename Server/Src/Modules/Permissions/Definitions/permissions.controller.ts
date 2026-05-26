import type { Database } from "../../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { PermissionRepo } from "./permissions.repository.js";
import { PermissionService } from "./permissions.service.js";
import type { Permission } from "./permissions.types.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../../Utilities/HttpFunctions.js";

export const PermissionController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const permissionRepo = new PermissionRepo(database),
    permissionService = new PermissionService(permissionRepo);

  try {
    switch (request.method) {
      case "GET":
        let responseBody: any;

        if (!pathNames[2])
          responseBody = await permissionService.getAllPermission();
        else {
          const permissionId = pathNames[2];

          responseBody = await permissionService.getPermission(permissionId);
        }

        sendResponseMessage(200, responseBody, response);

        break;
      case "POST":
        const postReqBody: any = await getRequestBody(request);

        const permissionCreation: Permission =
          await permissionService.createPermission(postReqBody);

        sendResponseMessage(201, permissionCreation, response);

        break;
      case "PATCH":
        const patchReqBody: any = await getRequestBody(request);

        const permissionUpdate: Permission =
          await permissionService.editPermission(patchReqBody);

        sendResponseMessage(200, permissionUpdate, response);

        break;
      case "DELETE":
        if (!pathNames[2])
          return sendErrorMessage(
            400,
            "Invalid permission id in url pathname",
            response,
          );

        const permissionId = pathNames[2];

        await permissionService.deletePermission(permissionId);

        sendResponseMessage(204, "Permission deleted successfully", response);
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP method header", response);
        break;
    }
  } catch (error) {
    sendErrorMessage(500, `${(error as Error).message}`, response);
  }
};
