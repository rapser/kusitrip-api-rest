import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './reviews.repository';
import { PrismaReviewsRepository } from './prisma-reviews.repository';
import { ActivitiesModule } from '../activities/activities.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ActivitiesModule, AuthModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    { provide: ReviewsRepository, useClass: PrismaReviewsRepository },
  ],
})
export class ReviewsModule {}
