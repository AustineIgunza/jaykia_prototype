import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { RatingRepo } from "./rating.repository.js";
import { RatingServ } from "./rating.service.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";

export const RatingController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const ratingRepo = new RatingRepo(database),
    ratingService = new RatingServ(ratingRepo);

  const userDetails = AuthValidator(request);

  if (!userDetails.success) {
    sendErrorMessage(userDetails.statusCode, userDetails.errorMsg, response);
    return;
  }

  try {
    switch (request.method) {
      case "GET":
        if (!pathnames[2])
          sendErrorMessage(400, "Required parameters not provided", response);
        else {
          if (pathnames[2] == "all") {
            const ratings = await ratingService.getAllRating();

            sendResponseMessage(200, ratings, response);
          } else if (pathnames[2].length > 0) {
            const ratingId = pathnames[2],
              rating = await ratingService.getRating(ratingId);

            sendResponseMessage(200, rating, response);
          } else {
            const userRating = await ratingService.getUserRating(
              userDetails.userId,
            );

            sendResponseMessage(200, userRating, response);
          }
        }

        break;
      case "POST":
        const postBody: any = getRequestBody(request);

        let postBookingId = pathnames[2];
        if (!postBookingId)
          sendErrorMessage(400, "Booking id not provided", response);
        else {
          const newRating = ratingService.createRating(
            userDetails.userId,
            postBookingId,
            postBody,
          );

          sendResponseMessage(201, newRating, response);
        }

        break;
      case "PATCH":
        const patchedBody: any = getRequestBody(request);

        let patchbookingId = pathnames[2];
        if (!patchbookingId)
          sendErrorMessage(400, "Booking id not provided", response);
        else {
          const patchedRating = await ratingService.editRating(
            userDetails.userId,
            patchbookingId,
            patchedBody,
          );

          sendResponseMessage(200, patchedRating, response);
        }

        break;
      case "DELETE":
        let deleteBookingId = pathnames[2];

        if (!deleteBookingId)
          sendErrorMessage(400, "Booking id not provided", response);
        else {
          await ratingService.deleteRating(userDetails.userId, deleteBookingId);

          sendResponseMessage(204, "Deleted successfully", response);
        }
        break;
      default:
        sendErrorMessage(400, "Invalid http header method", response);
        break;
    }
  } catch (error) {
    sendErrorMessage(500, (error as Error).message, response);
  }
};
