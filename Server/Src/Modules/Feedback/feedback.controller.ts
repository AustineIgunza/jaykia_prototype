import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { FeedbackRepo } from "./feedback.repository.js";
import { FeedbackServ } from "./feedback.service.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import type { createFeedbackDTO, updateFeedbackDTO } from "./feedback.types.js";

export const FeedbackController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const feedbackRepo = new FeedbackRepo(database),
    feedbackService = new FeedbackServ(feedbackRepo);

  const userObject = AuthValidator(request);
  if (!userObject.success) {
    sendErrorMessage(userObject.statusCode, userObject.errorMsg, response);
    return;
  }

  try {
    switch (request.method) {
      case "GET":
        if (pathnames[2] == "all") {
          const allFeedback = await feedbackService.getAllFeedback();
          sendResponseMessage(200, allFeedback, response);
        } else if (pathnames[2] == "user") {
          const userFeedback = await feedbackService.getUserFeedback(
            userObject.userId,
          );
          sendResponseMessage(200, userFeedback, response);
        } else {
          const specificFeedback = await feedbackService.getFeedback(
            pathnames[2]!,
          );
          sendResponseMessage(200, specificFeedback, response);
        }

        break;
      case "POST":
        const postFeedbackBody = getRequestBody(request),
          createFeedback = await feedbackService.createFeedback(
            userObject.userId,
            postFeedbackBody as any as createFeedbackDTO,
          );

        sendResponseMessage(201, createFeedback, response);
        break;
      case "PATCH":
        const patchFeedbackBody = getRequestBody(request),
          patchFeedback = await feedbackService.editFeedback(
            patchFeedbackBody as any as updateFeedbackDTO,
            pathnames[2]!,
            userObject.userId,
          );

        sendResponseMessage(200, patchFeedback, response);
        break;
      case "DELETE":
        await feedbackService.deleteFeedback(pathnames[2]!, userObject.userId);

        sendResponseMessage(204, "Deletion successful", response);
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {
    sendErrorMessage(500, (error as Error).message, response);
  }
};
