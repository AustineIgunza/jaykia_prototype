import type { Database } from "../../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { RolePermissionRepo } from "./role_permissions.repository.js";
import { UserPermissionServ } from "./role_permissions.service.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const RolePermissionController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const rolePermissionRepo = new RolePermissionRepo(database),
    rolePermissionServ = new UserPermissionServ(rolePermissionRepo);

  const userDetails = AuthValidator(request);
  if (!userDetails.success)
    return sendErrorMessage(
      userDetails.statusCode,
      userDetails.errorMsg,
      response,
    );

  try {
    switch (request.method) {
      case "GET":
        if (pathnames.length < 3 || !pathnames[2])
          sendErrorMessage(400, "Role id not provided", response);

        const roleId: string = pathnames[2]!,
          rolePermissions = await rolePermissionServ.getRolePermissions(roleId);

        sendResponseMessage(200, rolePermissions, response);
        break;
      case "POST":
        const reqBody: any = await getRequestBody(request);

        const createRequest = await rolePermissionServ.createRPermission(
          reqBody.role_id,
          reqBody.permission_id,
        );

        sendResponseMessage(201, createRequest, response);
        break;
      case "DELETE":
        const userAuthDel = AuthValidator(request);

        if (!userAuthDel.success) {
          sendErrorMessage(
            userAuthDel.statusCode,
            userAuthDel.errorMsg,
            response,
          );
          return;
        }

        await rolePermissionServ.deleteRolePermissions(
          userAuthDel.userId,
          (reqBody as any).id,
        );

        sendResponseMessage(204, "Deleted successfully", response);
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {
    if (!response.headersSent)
      sendErrorMessage(500, (error as Error).message, response);
    else request.destroy();
  }
};
