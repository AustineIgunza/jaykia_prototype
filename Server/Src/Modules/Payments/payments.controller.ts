import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import type { Database } from "../../Config/DB.js";
import type { IncomingMessage, ServerResponse } from "http";
import { PaymentRepo } from "./payments.repository.js";
import { PaymentServ } from "./payments.service.js";
import { PayStack } from "./Paystack/paystack.service.js";
import { PAYSTACK_SKEY } from "../../Config/Env.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { UserRepo } from "../Users/user.repository.js";

export const PaymentController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const payStack = new PayStack(PAYSTACK_SKEY!, database),
    userRepo = new UserRepo(database),
    paymentRepo = new PaymentRepo(database),
    paymentService = new PaymentServ(userRepo, paymentRepo, payStack);

  try {
    const reqBody = await getRequestBody(request);

    if (pathnames[2] == "initialize") {
      const user = AuthValidator(request);
      if (!user.success)
        return sendErrorMessage(user.statusCode, user.errorMsg, response);

      if (pathnames[3] == "payment") {
        const newPayment = await paymentService.initializeTransaction(
          user.userId,
          reqBody.bookingId,
          reqBody.amount,
        );

        sendResponseMessage(201, newPayment, response);
      } else if (pathnames[3] == "invoice") {
        const newInvoice = await paymentService.initializeInvoice(
          user.userId,
          reqBody.bookingId,
          reqBody.amount,
        );

        sendResponseMessage(201, newInvoice, response);
      } else {
        sendErrorMessage(404, "Invalid url endpoint", response);
      }
    } else if (pathnames[2] == "callback") {
      await payStack.webHookHandler(reqBody.id, reqBody.event);

      sendResponseMessage(200, "WebHook received successfully", response);
    } else {
      sendResponseMessage(404, "Invalid payments api", response);
    }
  } catch (error) {
    sendErrorMessage(500, (error as Error).message, response);
  }
};
