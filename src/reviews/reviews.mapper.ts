import { Review } from '@prisma/client';
import { ReviewResponseDto } from './dto/review-response.dto';

export function toReviewResponse(review: Review): ReviewResponseDto {
  return {
    id: review.id,
    activityId: review.activityId,
    authorName: review.authorName,
    city: review.city,
    rating: review.rating,
    comment: review.comment,
    travelType: review.travelType,
    publishedAt: review.publishedAt.toISOString(),
  };
}
