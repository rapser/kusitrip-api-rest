import { ActivityResponseDto } from './dto/activity-response.dto';
import { ActivityWithCategory } from './activities.repository';
import { toCategoryResponse } from '../categories/categories.mapper';

export function toActivityResponse(
  activity: ActivityWithCategory,
): ActivityResponseDto {
  const price = Number(activity.price);
  return {
    id: activity.id,
    title: activity.title,
    summary: activity.summary,
    description: activity.description,
    price,
    originalPrice:
      activity.originalPrice === null ? null : Number(activity.originalPrice),
    currency: activity.currency,
    rating: activity.rating,
    reviewCount: activity.reviewCount,
    travelerCount: activity.travelerCount,
    category: toCategoryResponse(activity.category),
    destinationId: activity.destinationId,
    imageUrls: activity.imageUrls,
    durationMinutes: activity.durationMinutes,
    language: activity.language,
    freeCancellationDays: activity.freeCancellationDays,
    isFree: price === 0,
    isFeatured: activity.isFeatured,
    meetingPoint: activity.meetingPoint,
    includes: activity.includes,
  };
}
