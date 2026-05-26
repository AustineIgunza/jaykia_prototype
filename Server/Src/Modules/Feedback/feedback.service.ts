import { Warning } from "../../../Utilities/Logger.js";
import type {
  createFeedbackDTO,
  Feedback,
  FeedbackRepository,
  FeedbackService,
  updateFeedbackDTO,
} from "./feedback.types.js";

export class FeedbackServ implements FeedbackService {
  constructor(private feedbackRepo: FeedbackRepository) {}

  async createFeedback(
    userId: string,
    feedbackDetails: createFeedbackDTO,
  ): Promise<Feedback> {
    try {
      if (!userId) throw new Error(`User id not provided`);
      const allowedFields: string[] = ["feedback", "feedback_type"];

      let filteredBookingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(feedbackDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        filteredBookingDetails[key] = value;
      }

      const createFeedbackQuery = await this.feedbackRepo.createFeedback(
        userId,
        filteredBookingDetails as createFeedbackDTO,
      );

      return createFeedbackQuery;
    } catch (error) {
      Warning(`Error at creating feedback`);
      throw error;
    }
  }

  async editFeedback(
    newFeedbackDetails: updateFeedbackDTO,
    feedbackId: string,
    userId: string,
  ): Promise<Feedback> {
    try {
      if (!userId || !newFeedbackDetails)
        throw new Error("User id and feedback details must be provided");

      const allowedFields: string[] = ["feedback", "feedback_type"];

      let newFilteredBookingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(newFeedbackDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        newFilteredBookingDetails[key] = value;
      }

      const editFeedbackQuery = await this.feedbackRepo.editFeedback(
        newFilteredBookingDetails as updateFeedbackDTO,
        feedbackId,
        userId,
      );

      return editFeedbackQuery;
    } catch (error) {
      Warning(`Error at editing feedback`);
      throw error;
    }
  }

  async getAllFeedback(): Promise<Feedback[]> {
    try {
      return await this.feedbackRepo.getAllFeedback();
    } catch (error) {
      Warning(`Error at retrieving all feedback`);
      throw error;
    }
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    try {
      if (!userId) throw new Error("User id should be provided");

      const userFeedback = await this.feedbackRepo.getUserFeedback(userId);

      return userFeedback;
    } catch (error) {
      Warning(`Error at retrieving user feedback`);
      throw error;
    }
  }

  async getFeedback(feedbackId: string): Promise<Feedback> {
    try {
      if (!feedbackId) throw new Error("Feedback id should be provided");

      const feedback = await this.feedbackRepo.getFeedback(feedbackId);

      return feedback;
    } catch (error) {
      Warning(`Error at retrieving feedback`);
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string, userId: string): Promise<void> {
    try {
      if (!feedbackId || !userId)
        throw new Error("Feedback and User id must provided");

      await this.feedbackRepo.deleteFeedback(feedbackId, userId);
    } catch (error) {
      Warning(`Error at deleting feedback`);
      throw error;
    }
  }
}
