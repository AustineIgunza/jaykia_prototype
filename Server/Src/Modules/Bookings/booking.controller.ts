import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { BookingRepo } from "./booking.repository.js";
import { BookingServ } from "./booking.service.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import type { Booking } from "./booking.types.js";
import { Warning } from "../../../Utilities/Logger.js";

export const BookingController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const bookingRepo = new BookingRepo(database),
    bookingService = new BookingServ(bookingRepo);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    const userObject = AuthValidator(request);

    if (userObject.success == false) {
      if (userObject.errorMsg.includes("not provided")) {
        response.writeHead(401);
        response.end(
          JSON.stringify({
            error: "Auth token not provided",
          }),
        );
        return;
      } else {
        response.writeHead(403);
        response.end(
          JSON.stringify({
            error: "Auth token invalid",
          }),
        );
        return;
      }
    }

    try {
      const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

      switch (request.method) {
        case "GET":
          let responseBody: any;

          if (pathNames[2] == "one")
            responseBody = await bookingService.getBooking(
              userObject.userId,
              parsedReqBody.id,
            );
          else if (pathNames[2] == "user")
            responseBody = await bookingService.getUserBookings(
              userObject.userId,
            );
          else {
            response.writeHead(404);
            response.end(JSON.stringify({ error: "Invalid http api route " }));
            return;
          }

          response.writeHead(200);
          response.end(JSON.stringify(responseBody));
          break;
        case "POST":
          const newBooking: Booking = await bookingService.createBooking(
            userObject.userId,
            parsedReqBody,
          );

          response.writeHead(201);
          response.end(JSON.stringify(newBooking));
          break;
        case "PATCH":
          const patchedBooking: Booking = await bookingService.editBooking(
            userObject.userId,
            parsedReqBody,
          );

          response.writeHead(200);
          response.end(JSON.stringify(patchedBooking));
          break;
        case "DELETE":
          await bookingService.deleteBooking(
            userObject.userId,
            parsedReqBody.id,
          );

          response.writeHead(204);
          response.end();
          break;
        default:
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid HTTP header method",
            }),
          );
          break;
      }
    } catch (error) {
      Warning(`Error at booking controller`);
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
