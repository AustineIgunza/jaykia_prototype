import type { IncomingMessage, ServerResponse } from "http";
import type { Database } from "../../../Config/DB.js";
import { UserRoleRepo } from "./user_roles.repository.js";
import { UserRolesServ } from "./user_roles.service.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const UserRoleController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const userRoleRepo = new UserRoleRepo(database),
    userRoleService = new UserRolesServ(userRoleRepo);

  const userObject = AuthValidator(request);
  if (!userObject.userId)
    return sendErrorMessage(
      userObject.statusCode,
      userObject.errorMsg,
      response,
    );

  try {
    switch (request.method) {
      case "GET":
        let requestBody: any;

        if (!pathnames[2])
          requestBody = await userRoleService.getUserRoles(userObject.userId);
        else if (pathnames[2] == "permissions")
          requestBody = await userRoleService.getUserRolesWithPermissions(
            userObject.userId,
          );

        sendResponseMessage(200, requestBody, response);
        break;
      case "POST":
        if (!pathnames[2])
          return sendErrorMessage(400, "Invalid role id passed in", response);

        const createUserRole = await userRoleService.createUserRole(
          userObject.userId,
          pathnames[2],
        );

        sendResponseMessage(201, createUserRole, response);
        break;
      case "DELETE":
        if (!pathnames[2])
          return sendErrorMessage(400, "Invalid role id passed in", response);

        await userRoleService.deleteUserRole(userObject.userId, pathnames[2]);

        sendResponseMessage(204, "Deletion successful", response);
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP method, try again", response);
        break;
    }
  } catch (error) {
    sendErrorMessage(400, (error as Error).message, response);
  }
};
