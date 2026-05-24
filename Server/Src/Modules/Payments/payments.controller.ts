import type { IncomingMessage, ServerResponse } from "http";
import type { Database } from "../../Config/DB.js";
import type { MpesaCallbackBody, StripeInitiateDTO } from "./payments.types.js";
import {
  getRequestBody,
  sendErrorMessage,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { PaymentRepo } from "./payments.repository.js";
import { PaymentServ } from "./payments.service.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { ErrorMsg } from "../../../Utilities/Logger.js";

/**
 * Route map
 *
 * ── Public (no auth) ─────────────────────────────────────────────────────────
 * POST  /payments/mpesa/callback    – Safaricom STK callback
 * POST  /payments/stripe/webhook    – Stripe webhook (raw body required)
 *
 * ── Authenticated ────────────────────────────────────────────────────────────
 * POST  /payments/mpesa/initiate    – Trigger M-Pesa STK push
 * POST  /payments/stripe/initiate   – Create + confirm Stripe PaymentIntent
 *
 * GET   /payments                   – Current user's payments
 * GET   /payments/all               – All payments (admin)
 * GET   /payments/:id               – Single payment
 *
 * DELETE /payments/:id              – Delete a payment record
 */
export const PaymentController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);
  // e.g. /api/payments/stripe/webhook → ["api", "payments", "stripe", "webhook"]
  const pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const paymentRepo = new PaymentRepo(database);
  const paymentService = new PaymentServ(paymentRepo);

  try {
    // ── Public: M-Pesa callback ───────────────────────────────────────────────
    if (
      request.method === "POST" &&
      pathnames[2] === "mpesa" &&
      pathnames[3] === "callback"
    ) {
      const body = (await getRequestBody(request)) as MpesaCallbackBody;
      await paymentService.handleMpesaCallback(body);
      // Safaricom retries unless it sees exactly this shape
      return sendResponseMessage(
        200,
        { ResultCode: 0, ResultDesc: "Success" },
        response,
      );
    }

    // ── Public: Stripe webhook ────────────────────────────────────────────────
    // IMPORTANT: must read the raw body BEFORE any JSON parsing so the
    // HMAC signature check can work correctly.
    if (
      request.method === "POST" &&
      pathnames[2] === "stripe" &&
      pathnames[3] === "webhook"
    ) {
      const rawBody = await getRawBody(request);
      const signature = request.headers["stripe-signature"];

      if (!signature || typeof signature !== "string") {
        return sendErrorMessage(
          400,
          "Missing Stripe-Signature header",
          response,
        );
      }

      await paymentService.handleStripeWebhook(rawBody, signature);
      // Stripe retries on anything other than 2xx
      return sendResponseMessage(200, { received: true }, response);
    }

    // ── Auth guard ────────────────────────────────────────────────────────────
    const userDetails = AuthValidator(request);
    if (!userDetails.success) {
      return sendErrorMessage(
        userDetails.statusCode,
        userDetails.errorMsg,
        response,
      );
    }

    const { userId } = userDetails;

    switch (request.method) {
      // ── GET ─────────────────────────────────────────────────────────────────
      case "GET": {
        if (pathnames[2] === "all") {
          const all = await paymentService.getAllPayments();
          return sendResponseMessage(200, all, response);
        }
        if (pathnames[2]) {
          const payment = await paymentService.getPaymentById(pathnames[2]);
          return sendResponseMessage(200, payment, response);
        }
        const mine = await paymentService.getUserPayments(userId);
        return sendResponseMessage(200, mine, response);
      }

      // ── POST ────────────────────────────────────────────────────────────────
      case "POST": {
        // POST /payments/mpesa/initiate
        if (pathnames[2] === "mpesa" && pathnames[3] === "initiate") {
          const body = (await getRequestBody(request)) as {
            booking_id?: string;
            amount?: number;
            phone_number?: string;
          };

          const { booking_id, amount, phone_number } = body;
          if (!booking_id || !amount || !phone_number) {
            return sendErrorMessage(
              400,
              "booking_id, amount, and phone_number are required",
              response,
            );
          }

          const result = await paymentService.initiateMpesa(
            userId,
            booking_id,
            amount,
            phone_number,
          );
          return sendResponseMessage(201, result, response);
        }

        // POST /payments/stripe/initiate
        if (pathnames[2] === "stripe" && pathnames[3] === "initiate") {
          const body = (await getRequestBody(
            request,
          )) as Partial<StripeInitiateDTO>;
          const { booking_id, amount, payment_method_id, email } = body;

          if (!booking_id || !amount || !payment_method_id) {
            return sendErrorMessage(
              400,
              "booking_id, amount, and payment_method_id are required",
              response,
            );
          }

          const result = await paymentService.initiateStripe(userId, {
            booking_id: booking_id!,
            amount: amount!,
            payment_method_id: payment_method_id!,
            email: email!,
          });
          return sendResponseMessage(201, result, response);
        }

        return sendErrorMessage(400, "Invalid payment endpoint", response);
      }

      // ── DELETE ───────────────────────────────────────────────────────────────
      case "DELETE": {
        if (!pathnames[2]) {
          return sendErrorMessage(400, "Payment ID is required", response);
        }
        await paymentService.deletePayment(userId, pathnames[2]);
        return sendResponseMessage(
          200,
          { message: "Payment record deleted" },
          response,
        );
      }

      default:
        return sendErrorMessage(405, "Method Not Allowed", response);
    }
  } catch (error) {
    const err = error as Error;
    ErrorMsg(err);

    if (err.message === "Forbidden")
      return sendErrorMessage(403, "Forbidden", response);
    if (err.message.includes("not found"))
      return sendErrorMessage(404, err.message, response);
    if (err.message.includes("signature"))
      return sendErrorMessage(400, err.message, response);

    return sendErrorMessage(500, err.message, response);
  }
};

// ─── Raw body reader ──────────────────────────────────────────────────────────
// Stripe signature verification requires the original bytes, not parsed JSON.

function getRawBody(request: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}
