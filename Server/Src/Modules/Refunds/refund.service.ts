import { Warning } from "../../../Utilities/Logger.js";
import type {
  createRefundDTO,
  Refund,
  RefundRepository,
  RefundService,
  updateRefundDTO,
} from "./refund.types.js";

export class RefundServ implements RefundService {
  constructor(private refundRepo: RefundRepository) {}

  async createRefund(
    userId: string,
    refundDetails: createRefundDTO,
  ): Promise<Refund> {
    try {
      if (!userId || !refundDetails)
        throw new Error("User id and refund details not provided");

      const allowedFields: string[] = ["bookingId", "reason"];
      let filteredRefundDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(refundDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (value.length <= 0) throw new Error(`${key} is empty`);

        filteredRefundDetails[key] = value;
      }

      const refundCreation = await this.refundRepo.createRefund(
        userId,
        filteredRefundDetails as createRefundDTO,
      );

      return refundCreation;
    } catch (error) {
      Warning("Error at creating refund");
      throw error;
    }
  }

  async editRefund(
    refundId: string,
    userId: string,
    refundDetails: updateRefundDTO,
  ): Promise<Refund> {
    try {
      if (!refundId || !userId || !refundDetails)
        throw new Error(
          "Refund id, user id and refund details must be provided",
        );

      const allowedFields: string[] = [
        "bookingId",
        "reason",
        "cancelled",
        "approved",
      ];
      let filteredRefundDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(refundDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} is empty`);

        filteredRefundDetails[key] = value;
      }

      const refundUpdate = await this.refundRepo.editRefund(
        refundId,
        userId,
        filteredRefundDetails as updateRefundDTO,
      );

      return refundUpdate;
    } catch (error) {
      Warning("Error at editing refund");
      throw error;
    }
  }

  async getUserRefunds(userId: string): Promise<Refund[]> {
    try {
      if (!userId) throw new Error("User id not provided");

      const userRefunds: Refund[] =
        await this.refundRepo.getUserRefunds(userId);

      return userRefunds;
    } catch (error) {
      Warning("Error at ");
      throw error;
    }
  }

  async getAllRefunds(): Promise<Refund[]> {
    try {
      const allRefunds: Refund[] = await this.refundRepo.getAllRefunds();

      return allRefunds;
    } catch (error) {
      Warning("Error at ");
      throw error;
    }
  }

  async deleteRefund(refundId: string, userId: string): Promise<void> {
    try {
      if (!userId || !refundId)
        throw new Error("User id and refund id must be provided");

      await this.refundRepo.deleteRefund(refundId, userId);
    } catch (error) {
      Warning("Error at ");
      throw error;
    }
  }
}
