import type { IncomingMessage, ServerResponse } from "http";
import type { Database } from "../../Config/DB.js";
import { UserRepo } from "./user.repository.js";
import { UserServ } from "./user.service.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";

export const UserController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const userRepo = new UserRepo(database),
    userService = new UserServ(userRepo);

  try {
    const userDetails = AuthValidator(request);

    if (!userDetails.success)
      return sendErrorMessage(
        userDetails.statusCode,
        userDetails.errorMsg,
        response,
      );

    switch (request.method) {
      case "GET":
        if (pathNames[2] == "all") {
          const allUsers = await userService.getAllUsers();

          sendResponseMessage(200, allUsers, response);
        } else {
          const user = await userService.getUser(userDetails.userId);

          sendResponseMessage(200, user, response);
        }
        break;
      case "PATCH":
        const patchReqBody: any = await getRequestBody(request);
        console.log(patchReqBody);
        const patchedUser = await userService.editUser(
          userDetails.userId,
          patchReqBody,
        );

        sendResponseMessage(200, patchedUser, response);
        break;
      case "DELETE":
        await userService.deleteUser(userDetails.userId);

        sendResponseMessage(204, "User deletion successful", response);
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {
    sendErrorMessage(500, (error as Error).message, response);
  }
};
