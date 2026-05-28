import type { IncomingMessage } from "http";
import https from "https";
import type {
  Invoice,
  Customer,
  PayStackInitializor,
  PayStackService,
} from "./paystack.types.js";
import type { Database } from "../../../Config/DB.js";
import { UserServ } from "../../Users/user.service.js";
import { UserRepo } from "../../Users/user.repository.js";
import { PaymentRepo } from "../payments.repository.js";
import { PaymentServ } from "../payments.service.js";

export class PayStack implements PayStackService {
  constructor(
    private paystackSKey: string,
    private db: Database,
  ) {}

  async initializeTransaction(
    userId: string,
    amount: number,
  ): Promise<PayStackInitializor> {
    return new Promise<PayStackInitializor>(async (resolve, reject) => {
      try {
        const userService = new UserServ(new UserRepo(this.db)),
          user = await userService.getUser(userId);

        const initialize = https.request(
          {
            method: "POST",
            host: "api.paystack.co",
            path: "/transaction/initialize",
            headers: {
              authorization: `Bearer ${this.paystackSKey}`,
              accept: "application/json",
              "content-type": "application/json",
            },
          },
          (response: IncomingMessage) => {
            let unparsedReqBody: string = "";

            response.on("data", (data: Buffer) => {
              unparsedReqBody += data.toString();
            });

            response.on("error", (error) => reject(error));

            response.on("end", () => {
              const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

              resolve(parsedReqBody);
            });
          },
        );

        initialize.on("error", (error) => reject(error));

        initialize.write(
          JSON.stringify({
            email: user.email,
            amount: amount,
          }),
        );

        initialize.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async createCustomer(
    customerEmail: string,
    amount: number,
  ): Promise<Customer> {
    return new Promise<Customer>((resolve, reject) => {
      try {
        const customerCreation = https.request(
          {
            hostname: "api.paystack.co",
            port: 443,
            path: "/paymentrequest",
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.paystackSKey}`,
              "Content-Type": "application/json",
            },
          },
          (response: IncomingMessage) => {
            let unparsedReqBody: string = "";

            response.on("data", (data: Buffer) => {
              unparsedReqBody += data.toString();
            });

            response.on("end", () => {
              if (unparsedReqBody.length <= 0) reject({});

              const parsedReqBody = JSON.parse(unparsedReqBody);
              resolve(parsedReqBody);
            });

            response.on("error", (error) => reject(error));
          },
        );

        customerCreation.on("error", (error) => reject(error));

        customerCreation.write(
          JSON.stringify({
            email: customerEmail,
            amount: amount,
          }),
        );
        customerCreation.end();
      } catch (error) {
        reject(error);
        throw error;
      }
    });
  }

  async initializeInvoice(
    customerEmail: string,
    amount: number,
  ): Promise<Invoice> {
    return new Promise<Invoice>(async (resolve, reject) => {
      try {
        const newCustomer = await this.createCustomer(customerEmail, amount),
          invoiceCreation = https.request(
            {
              hostname: "api.paystack.co",
              port: 443,
              path: "/paymentrequest",
              method: "POST",
              headers: {
                Authorization: `Bearer ${this.paystackSKey}`,
                "Content-Type": "application/json",
              },
            },
            (response: IncomingMessage) => {
              let unparsedReqBody: string = "";

              response.on("data", (data: Buffer) => {
                unparsedReqBody += data.toString();
              });

              response.on("end", () => {
                if (unparsedReqBody.length <= 0) reject({});

                const parsedReqBody = JSON.parse(unparsedReqBody);

                resolve(parsedReqBody);
              });

              response.on("error", (error) => reject(error));
            },
          );

        invoiceCreation.on("error", (error) => reject(error));

        invoiceCreation.write(
          JSON.stringify({
            customer: newCustomer.data.id,
            amount: amount,
          }),
        );
        invoiceCreation.end();
      } catch (error) {
        reject(error);
        throw error;
      }
    });
  }

  async webHookHandler(reference: string, event: string) {
    const userRepo = new UserRepo(this.db);

    const paystack = new PayStack(this.paystackSKey, this.db),
      paymentRepo = new PaymentRepo(this.db),
      paymentService = new PaymentServ(userRepo, paymentRepo, paystack);

    switch (event) {
      case "paymentrequest.successful":
        await paymentService.updatePayment("", reference, {
          bookingId: "",
          payment_status: "paid",
        });
        break;
      default:
        console.log(event);
        break;
    }
  }
}
