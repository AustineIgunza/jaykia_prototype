export type Rating = {
  id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comments: string;
  created_at: string;
};

export type createRatingDTO =
  | Omit<Rating, "id" | "created_at" | "user_id">
  | (Pick<Rating, "booking_id" | "rating"> & Partial<Rating>);

export type updateRatingDTO = Omit<Rating, "created_at" | "id" | "user_id"> &
  Partial<Rating>;

export interface RatingRepository {
  createRating: (
    userId: string,
    ratingDetails: createRatingDTO,
  ) => Promise<Rating>;
  editRating: (
    userId: string,
    ratingId: string,
    ratingDetails: updateRatingDTO,
  ) => Promise<Rating>;
  getAllRating: () => Promise<Rating[]>;
  getUserRating: (userId: string) => Promise<Rating[]>;
  getRating: (ratingId: string) => Promise<Rating>;
  deleteRating: (ratingId: string, userId: string) => Promise<void>;
}
export interface RatingService {
  createRating: (
    userId: string,
    bookingId: string,
    ratingDetails: createRatingDTO,
  ) => Promise<Rating>;
  editRating: (
    userId: string,
    ratingId: string,
    ratingDetails: updateRatingDTO,
  ) => Promise<Rating>;
  getAllRating: () => Promise<Rating[]>;
  getUserRating: (userId: string) => Promise<Rating[]>;
  getRating: (ratingId: string) => Promise<Rating>;
  deleteRating: (ratingId: string, userId: string) => Promise<void>;
}
