import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { BookingRepo } from "./booking.repository.js";
import { BookingServ } from "./booking.service.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import type { Booking } from "./booking.types.js";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { SocketIOService } from "../Socket/socket.types.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { UserRoleRepo } from "../Roles/User Roles/user_roles.repository.js";
import { UserRolesServ } from "../Roles/User Roles/user_roles.service.js";
import { sendMail } from "../../../Utilities/MailSender.js";
import { UserRepo } from "../Users/user.repository.js";
import { UserServ } from "../Users/user.service.js";
import SendmailTransport from "nodemailer/lib/sendmail-transport/index.js";

export const BookingController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
  socketIO?: SocketIOService,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const bookingRepo = new BookingRepo(database),
    bookingService = new BookingServ(bookingRepo);

  const userRepo = new UserRepo(database),
    userService = new UserServ(userRepo);

  try {
    const userObject = AuthValidator(request);

    if (userObject.success == false) {
      sendErrorMessage(401, userObject.errorMsg, response);
      return;
    }

    const user = await userService.getUser(userObject.userId);
    const date = new Date();

    switch (request.method) {
      case "GET":
        let responseBody: any;

        if (!pathNames[2])
          responseBody = await bookingService.getUserBookings(
            userObject.userId,
          );
        else if (pathNames[2] == "all")
          responseBody = await bookingService.getAllBookings();
        else if (pathNames[2] == "user") {
          if (!pathNames[3])
            sendErrorMessage(
              400,
              "Invalid user id passed in on url segment",
              response,
            );
          else {
            responseBody = await bookingService.getUserBookings(pathNames[3]);
          }
        }

        sendResponseMessage(200, responseBody, response);
        break;
      case "POST":
        const postReqBody: any = await getRequestBody(request);

        const newBooking: Booking = await bookingService.createBooking(
          userObject.userId,
          postReqBody,
        );

        if (socketIO) socketIO.emitToAdmins("booking:new", newBooking);

        sendMail(user.email, {
          bookingId: newBooking.id,
          name: user.username,
          date: date.toUTCString(),
          passengers: newBooking.no_of_passengers,
          luggageItems: newBooking.no_of_luggage_items,
          departureTime: newBooking.departure_time,
          arrivalTime: newBooking.arrival_time,
          action: "created",
        });

        sendResponseMessage(201, newBooking, response);
        break;
      case "PATCH":
        const patchReqBody: any = await getRequestBody(request);

        if (!pathNames[2])
          return sendErrorMessage(400, "Invalid booking id provided", response);

        const bookingId = pathNames[2];

        if (patchReqBody.trip_status) {
          const userRoleRepo = new UserRoleRepo(database),
            userRoleService = new UserRolesServ(userRoleRepo),
            userRoles = await userRoleService.getUserRoles(userObject.userId);

          if (!userRoles.roles.includes("admin")) {
            sendErrorMessage(
              403,
              "Unauthorized, requires higher priviledges",
              response,
            );
          }
        }
        const patchedBooking: Booking = await bookingService.editBooking(
          userObject.userId,
          bookingId,
          patchReqBody,
        );

        if (socketIO)
          socketIO.emitToAdmins("booking:statusUpdate", patchedBooking);

        sendMail(user.email, {
          bookingId: patchedBooking.id,
          name: user.username,
          date: date.toUTCString(),
          passengers: patchedBooking.no_of_passengers,
          luggageItems: patchedBooking.no_of_luggage_items,
          departureTime: patchedBooking.departure_time,
          arrivalTime: patchedBooking.arrival_time,
          action: "updated",
        });

        sendResponseMessage(200, patchedBooking, response);
        break;
      case "DELETE":
        if (!pathNames[2])
          return sendErrorMessage(400, "Invalid booking id provided", response);

        const getBooking = await bookingService.getBooking(
          pathNames[2],
          userObject.userId,
        );

        await bookingService.deleteBooking(userObject.userId, pathNames[2]);

        if (socketIO) socketIO.emitToAdmins("booking:deletion", getBooking);

        sendMail(user.email, {
          bookingId: pathNames[2],
          name: user.username,
          date: date.toUTCString(),
          passengers: getBooking.no_of_passengers,
          luggageItems: getBooking.no_of_luggage_items,
          departureTime: getBooking.departure_time,
          arrivalTime: getBooking.arrival_time,
          action: "updated",
        });

        sendResponseMessage(204, "Deleted successfully", response);
        break;
      default:
        sendErrorMessage(405, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {
    ErrorMsg(error as Error);
    sendErrorMessage(400, (error as Error).message, response);
  }
};
