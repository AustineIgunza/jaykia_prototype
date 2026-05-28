import { Warning } from "../../../Utilities/Logger.js";
import { UserRepo } from "../Users/user.repository.js";
import { UserServ } from "../Users/user.service.js";
import type {
  Payment,
  PaymentRepository,
  PaymentService,
  updatePaymentDTO,
} from "./payments.types.js";
import type { PayStackInitializor } from "./Paystack/paystack.types.js";
import type { PayStackService } from "./Paystack/paystack.types.js";

export class PaymentServ implements PaymentService {
  constructor(
    private userRepo: UserRepo,
    private repo: PaymentRepository,
    private paystack: PayStackService,
  ) {}

  async initializeInvoice(
    userId: string,
    bookingId: string,
    amount: number,
  ): Promise<any> {
    try {
      if (!userId || !bookingId || amount)
        throw new Error("User id and booking id must be provided");

      const userService = new UserServ(this.userRepo),
        user = await userService.getUser(userId);

      const paystackTransaction = await this.paystack.initializeInvoice(
        user.email,
        amount,
      );
      await this.repo.initializePayment(user.email, {
        bookingId: bookingId,
        amount: amount,
        quoteType: "invoice",
        referenceId: paystackTransaction.data.id,
        paymentStatus: "pending",
      });

      return paystackTransaction;
    } catch (error) {
      throw error;
    }
  }

  async initializeTransaction(
    userId: string,
    bookingId: string,
    amount: number,
  ): Promise<PayStackInitializor> {
    try {
      if (!userId || !bookingId)
        throw new Error("User id and booking id must be provided");

      const userService = new UserServ(this.userRepo),
        user = await userService.getUser(userId);

      const paystackTransaction = await this.paystack.initializeTransaction(
        user.email,
        amount,
      );
      await this.repo.initializePayment(userId, {
        bookingId: bookingId,
        amount: amount,
        quoteType: "payment",
        referenceId: paystackTransaction.data.access_code,
        paymentStatus: "pending",
      });

      return paystackTransaction;
    } catch (error) {
      throw error;
    }
  }

  async updatePayment(
    userId: string,
    reference: string,
    newPaymentDetails: updatePaymentDTO,
  ) {
    if (!userId || !reference || !newPaymentDetails)
      throw new Error("Invalid user id, reference or payment details");

    const allowedFields: string[] = [];
    let filteredPaymentDetails: Record<string, any> = {};

    for (let [key, value] of Object.entries(newPaymentDetails)) {
      if (!allowedFields.includes(key)) continue;

      if (!value || value.toString().length <= 0)
        throw new Error(`${key} has an invalid value`);

      filteredPaymentDetails[key] = value;
    }

    const updatePayments = await this.repo.updatePayment(
      userId,
      reference,
      filteredPaymentDetails as updatePaymentDTO,
    );

    return updatePayments;
  }

  async getUserTransactions(userId: string): Promise<Payment[]> {
    try {
      const userTransactions = await this.repo.getUserTransactions(userId);

      return userTransactions;
    } catch (error) {
      Warning("Error at retrieving user transactions");
      throw error;
    }
  }
}
