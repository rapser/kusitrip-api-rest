import { Injectable } from '@nestjs/common';
import { Review } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewData, ReviewsRepository } from './reviews.repository';

@Injectable()
export class PrismaReviewsRepository extends ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findByActivity(activityId: string, take: number): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { activityId },
      orderBy: { publishedAt: 'desc' },
      take,
    });
  }

  create(data: CreateReviewData): Promise<Review> {
    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findUniqueOrThrow({
        where: { id: data.activityId },
        select: { rating: true, reviewCount: true },
      });
      const reviewCount = activity.reviewCount + 1;
      const rating =
        Math.round(
          ((activity.rating * activity.reviewCount + data.rating) /
            reviewCount) *
            10,
        ) / 10;
      await tx.activity.update({
        where: { id: data.activityId },
        data: { rating, reviewCount },
      });
      return tx.review.create({ data });
    });
  }
}
