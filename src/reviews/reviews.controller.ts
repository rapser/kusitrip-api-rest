import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('reviews')
@Controller('activities/:activityId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List the latest reviews of an activity' })
  findAll(
    @Param('activityId') activityId: string,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findByActivity(activityId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Write a review for an activity' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(user.userId, activityId, dto);
  }
}
