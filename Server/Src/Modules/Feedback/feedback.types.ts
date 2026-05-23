export type Feedback = {
  id: string;
  user_id: string;
  feedback: string;
  created_at: string;
  feedback_type: "comment" | "issue" | "critique";
};

export type createFeedbackDTO = Omit<Feedback, "id" | "created_at" | "user_id">;
export type updateFeedbackDTO = Omit<
  Feedback,
  "created_at" | "id" | "user_id"
> &
  Partial<Feedback>;

export interface FeedbackRepository {
  createFeedback: (
    userId: string,
    feedbackDetails: createFeedbackDTO,
  ) => Promise<Feedback>;
  editFeedback: (
    newFeedbackDetails: updateFeedbackDTO,
    feedbackId: string,
    userId: string,
  ) => Promise<Feedback>;
  getAllFeedback: () => Promise<Feedback[]>;
  getUserFeedback: (userId: string) => Promise<Feedback[]>;
  getFeedback: (feedbackId: string) => Promise<Feedback>;
  deleteFeedback: (feedbackId: string, userId: string) => Promise<void>;
}
export interface FeedbackService {
  createFeedback: (
    userId: string,
    feedbackDetails: createFeedbackDTO,
  ) => Promise<Feedback>;
  editFeedback: (
    newFeedbackDetails: updateFeedbackDTO,
    feedbackId: string,
    userId: string,
  ) => Promise<Feedback>;
  getAllFeedback: () => Promise<Feedback[]>;
  getUserFeedback: (userId: string) => Promise<Feedback[]>;
  getFeedback: (feedbackId: string) => Promise<Feedback>;
  deleteFeedback: (feedbackId: string, userId: string) => Promise<void>;
}
