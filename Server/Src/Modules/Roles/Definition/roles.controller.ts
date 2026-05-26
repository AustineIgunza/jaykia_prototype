import type { Database } from "../../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { RoleRepo } from "./roles.repository.js";
import { Roleservice } from "./roles.service.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const RoleController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
): Promise<void> => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  const roleRepo = new RoleRepo(database),
    roleService = new Roleservice(roleRepo);

  const userObject = AuthValidator(request);
  if (!userObject.success)
    return sendErrorMessage(
      userObject.statusCode,
      userObject.errorMsg,
      response,
    );

  try {
    switch (request.method) {
      case "GET":
        let responseBody: any;

        if (!pathNames[2]) responseBody = await roleService.getRoles();
        else if (pathNames[2] == "permissions") {
          if (!pathNames[3])
            return sendErrorMessage(400, "Invalid role id provided", response);

          const roleId = pathNames[3];
          responseBody = await roleService.getRoleWithPermissions(roleId);
        }

        sendResponseMessage(200, responseBody, response);
        break;
      case "POST":
        const postRoleBody: any = await getRequestBody(request),
          createRole = await roleService.createRole(postRoleBody);

        sendResponseMessage(201, createRole, response);
        break;
      case "PATCH":
        const patchRoleBody: any = await getRequestBody(request),
          updateRole = await roleService.editRole(
            patchRoleBody.id,
            patchRoleBody,
          );

        sendResponseMessage(200, updateRole, response);
        break;
      case "DELETE":
        const deleteRoleBody: any = await getRequestBody(request);
        await roleService.deleteRole(deleteRoleBody.id);

        sendResponseMessage(204, "Deletion successfully", response);
        break;
      default:
        sendErrorMessage(404, "Invalid HTTP method", response);
        break;
    }
  } catch (error) {
    sendErrorMessage(400, (error as Error).message, response);
  }
};
