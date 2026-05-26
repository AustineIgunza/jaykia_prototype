import { Warning } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type { updateRoleDTO } from "../Roles/Definition/roles.types.js";
import type {
  createRatingDTO,
  Rating,
  RatingRepository,
  RatingService,
  updateRatingDTO,
} from "./rating.types.js";

export class RatingServ implements RatingService {
  constructor(private ratingRepo: RatingRepository) {}

  async createRating(
    userId: string,
    bookingId: string,
    ratingDetails: createRatingDTO,
  ): Promise<Rating> {
    try {
      if (!userId || !ratingDetails)
        throw new Error("User id and rating details must be provided");

      const allowedFields: string[] = ["rating", "comments"];

      let filteredRatingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(ratingDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value && value.toString().length > 0)
          throw new Error(`${key} has an empty value`);

        filteredRatingDetails[key] = value;
      }

      const createRating: Rating = await this.ratingRepo.createRating(
        userId,
        bookingId,
        filteredRatingDetails as createRatingDTO,
      );

      return createRating;
    } catch (error) {
      Warning("Error at creating ratings");
      throw error;
    }
  }

  async editRating(
    userId: string,
    ratingId: string,
    ratingDetails: updateRatingDTO,
  ): Promise<Rating> {
    try {
      if (!ratingDetails) throw new Error("Rating details not provided");

      const allowedFields: string[] = ["rating", "comments"];
      let filteredRatingDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(ratingDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        filteredRatingDetails[key] = value;
      }

      const ratingCreation: Rating = await this.ratingRepo.editRating(
        userId,
        ratingId,
        filteredRatingDetails as updateRatingDTO,
      );

      return ratingCreation;
    } catch (error) {
      Warning("Error at editing rating");
      throw error;
    }
  }

  async getAllRating(): Promise<Rating[]> {
    try {
      const allRatings = await this.ratingRepo.getAllRating();

      return allRatings;
    } catch (error) {
      Warning("Error at retrieiving all user ratings");
      throw error;
    }
  }

  async getUserRating(userId: string): Promise<Rating[]> {
    try {
      if (!userId) throw new Error("User Id must be provided");

      const userRating = await this.ratingRepo.getUserRating(userId);

      return userRating;
    } catch (error) {
      Warning("Error at retrieving user rating");
      throw error;
    }
  }

  async getRating(ratingId: string): Promise<Rating> {
    try {
      if (!ratingId) throw new Error("Rating id must be provided");

      const rating = await this.ratingRepo.getRating(ratingId);

      return rating;
    } catch (error) {
      Warning("Error at getting rating");
      throw error;
    }
  }

  async deleteRating(ratingId: string, userId: string): Promise<void> {
    try {
      if (!ratingId || !userId)
        throw new Error("Rating id and user id must be provided");

      await this.ratingRepo.deleteRating(ratingId, userId);
    } catch (error) {
      Warning("");
      throw error;
    }
  }
}
