import type { IncomingMessage, ServerResponse } from "http";
import { Warning } from "../../Utilities/Logger.js";
import type { Database } from "../Config/DB.js";
import { UserRoleRepo } from "../Modules/Roles/User Roles/user_roles.repository.js";
import { UserRolesServ } from "../Modules/Roles/User Roles/user_roles.service.js";
import { AuthValidator } from "./AuthChecker.js";

export const RoleChecker = async (
  roleToCheckFor: string,
  database: Database,
  request: IncomingMessage,
): Promise<boolean> => {
  const userRoleRepo = new UserRoleRepo(database),
    userRoleService = new UserRolesServ(userRoleRepo);

  try {
    const userInfo = AuthValidator(request);

    if (!userInfo.success) {
      let responseStatusCode: number = 0,
        responseMessage: string = "";

      if (userInfo.errorMsg == "invalid") {
        responseStatusCode = 403;
        responseMessage = "Auth token malformed";
      } else {
        responseStatusCode = 401;
        responseMessage = "Auth token not provided";
      }

      return false;
    }

    const userRoles = await userRoleService.getUserRoles(userInfo.userId);

    if (!userRoles.roles.includes(roleToCheckFor)) return false;

    return true;
  } catch (error) {
    Warning("Error at role authentication");
    throw error;
  }
};
