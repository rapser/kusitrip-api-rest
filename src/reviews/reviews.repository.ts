import { Review } from '@prisma/client';

export interface CreateReviewData {
  activityId: string;
  userId: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  travelType: string;
}

export abstract class ReviewsRepository {
  abstract findByActivity(activityId: string, take: number): Promise<Review[]>;
  /** Persists the review and folds its score into the activity aggregate. */
  abstract create(data: CreateReviewData): Promise<Review>;
}
