import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { RefundRepo } from "./refund.repository.js";
import { RefundServ } from "./refund.service.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { RoleChecker } from "../../Middleware/RoleChecker.js";
import type { Refund } from "./refund.types.js";

export const RefundController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const refundRepo = new RefundRepo(database),
    refundService = new RefundServ(refundRepo);

  try {
    const userDetails = AuthValidator(request);

    if (!userDetails.success) {
      sendErrorMessage(userDetails.statusCode, userDetails.errorMsg, response);
      return;
    }

    switch (request.method) {
      case "GET":
        if (!pathnames[2]) {
          const userRefunds = await refundService.getUserRefunds(
            userDetails.userId,
          );

          sendResponseMessage(200, userRefunds, response);
        } else if (pathnames[2] == "all") {
          const roleChecker: boolean = await RoleChecker(
            "admin",
            database,
            request,
          );

          if (!roleChecker)
            sendErrorMessage(403, "User unauthorized", response);
          else {
            const allRefunds = await refundService.getAllRefunds();

            sendResponseMessage(200, allRefunds, response);
          }
        } else {
          sendErrorMessage(
            400,
            "Invalid url segment for GET response",
            response,
          );
        }

        break;
      case "POST":
        if (!pathnames[2])
          return sendErrorMessage(400, "Invalid booking id provided", response);

        const bookingId = pathnames[2];

        const postRefundDetails: any = await getRequestBody(request),
          refundCreation: Refund = await refundService.createRefund(
            userDetails.userId,
            bookingId,
            postRefundDetails,
          );

        sendResponseMessage(201, refundCreation, response);

        break;
      case "PATCH":
        if (!pathnames[2] || pathnames[2].length <= 0)
          sendErrorMessage(400, "Invalid refund id", response);
        else {
          const patchRefundDetails: any = await getRequestBody(request),
            refundId = pathnames[2],
            patchRefund = await refundService.editRefund(
              refundId,
              userDetails.userId,
              patchRefundDetails,
            );

          sendResponseMessage(200, patchRefund, response);
        }

        break;
      case "DELETE":
        if (!pathnames[2] || pathnames[2].length <= 0)
          sendErrorMessage(400, "Invalid refund id", response);
        else {
          const refundId = pathnames[2];
          await refundService.deleteRefund(refundId, userDetails.userId);

          sendResponseMessage(204, "Refund deleted successfully", response);
        }
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP header method", response);
    }
  } catch (error) {
    sendErrorMessage(400, (error as Error).message, response);
  }
};
