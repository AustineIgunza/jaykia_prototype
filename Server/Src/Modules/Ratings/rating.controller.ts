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
        const postBody: any = await getRequestBody(request);

        if (!pathnames[2])
          return sendErrorMessage(400, "Booking id not provided", response);

        let postBookingId = pathnames[2];

        const newRating = await ratingService.createRating(
          userDetails.userId,
          postBookingId,
          postBody,
        );

        sendResponseMessage(201, newRating, response);

        break;
      case "PATCH":
        const patchedBody: any = await getRequestBody(request);

        let patchRatingId = pathnames[2];
        if (!patchRatingId)
          sendErrorMessage(400, "Rating id not provided", response);
        else {
          const patchedRating = await ratingService.editRating(
            userDetails.userId,
            patchRatingId,
            patchedBody,
          );

          sendResponseMessage(200, patchedRating, response);
        }

        break;
      case "DELETE":
        let deleteRatingId = pathnames[2];

        if (!deleteRatingId)
          sendErrorMessage(400, "Rating id not provided", response);
        else {
          await ratingService.deleteRating(deleteRatingId, userDetails.userId);

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
