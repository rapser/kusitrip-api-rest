import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/exceptions/api.exception';
import { ActivitiesService } from '../activities/activities.service';
import { UsersRepository } from '../auth/repositories/users.repository';
import { ReviewsRepository } from './reviews.repository';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { toReviewResponse } from './reviews.mapper';

const MAX_REVIEWS = 30;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviews: ReviewsRepository,
    private readonly users: UsersRepository,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findByActivity(activityId: string): Promise<ReviewResponseDto[]> {
    await this.activitiesService.findOne(activityId);
    const reviews = await this.reviews.findByActivity(activityId, MAX_REVIEWS);
    return reviews.map(toReviewResponse);
  }

  async create(
    userId: string,
    activityId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    await this.activitiesService.findOne(activityId);
    const user = await this.users.findById(userId);
    if (!user) {
      throw new ApiException(
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
        'authentication_error',
      );
    }
    const review = await this.reviews.create({
      activityId,
      userId,
      authorName: `${user.name} ${user.surname.charAt(0)}.`,
      city: dto.city?.trim() ?? '',
      rating: dto.rating,
      comment: dto.comment.trim(),
      travelType: dto.travelType ?? '',
    });
    return toReviewResponse(review);
  }
}
