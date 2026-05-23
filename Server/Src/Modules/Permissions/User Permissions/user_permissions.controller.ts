import type { Database } from "../../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { UserPermissionRepo } from "./user_permissions.repository.js";
import { UserPermissionServ } from "./user_permissions.service.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const UserPermissionController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const userPermissionRepo = new UserPermissionRepo(database),
    userPermissionServ = new UserPermissionServ(userPermissionRepo);

  try {
    switch (request.method) {
      case "GET":
        if (pathnames.length < 3 || !pathnames[2])
          sendErrorMessage(400, "User id not provided", response);

        const userId: string = pathnames[2]!,
          userPermissions = await userPermissionServ.getUserPermissions(userId);

        sendResponseMessage(200, userPermissions, response);
        break;
      case "POST":
        const userAuthPost = AuthValidator(request),
          reqBody = await getRequestBody(request);

        if (!userAuthPost.success) {
          sendErrorMessage(
            userAuthPost.statusCode,
            userAuthPost.errorMsg,
            response,
          );
          return;
        }

        const createRequest = await userPermissionServ.createUPermission(
          userAuthPost.userId,
          (reqBody as any).id,
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

        await userPermissionServ.deleteUPermissions(
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
