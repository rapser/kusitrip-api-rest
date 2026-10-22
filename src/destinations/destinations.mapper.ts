import { Destination } from '@prisma/client';
import { DestinationResponseDto } from './dto/destination-response.dto';

export function toDestinationResponse(
  destination: Destination,
): DestinationResponseDto {
  return {
    id: destination.id,
    name: destination.name,
    country: destination.country,
    continent: destination.continent,
    imageUrl: destination.imageUrl,
    activityCount: destination.activityCount,
    travelerCount: destination.travelerCount,
    reviewCount: destination.reviewCount,
    rating: destination.rating,
    description: destination.description,
  };
}
