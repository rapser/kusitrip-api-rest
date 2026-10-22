import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActivitiesRepository,
  ActivityFilter,
  ActivityWithCategory,
  PageRequest,
} from './activities.repository';

@Injectable()
export class PrismaActivitiesRepository extends ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findMany(
    filter: ActivityFilter,
    page?: PageRequest,
  ): Promise<ActivityWithCategory[]> {
    return this.prisma.activity.findMany({
      where: this.buildWhere(filter),
      include: { category: true },
      // Featured first, then most booked — mirrors Civitatis' default ranking.
      orderBy: [{ isFeatured: 'desc' }, { travelerCount: 'desc' }],
      skip: page?.skip,
      take: page?.take,
    });
  }

  count(filter: ActivityFilter): Promise<number> {
    return this.prisma.activity.count({ where: this.buildWhere(filter) });
  }

  findById(id: string): Promise<ActivityWithCategory | null> {
    return this.prisma.activity.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  private buildWhere(filter: ActivityFilter): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {};
    if (filter.destinationId) where.destinationId = filter.destinationId;
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.featured !== undefined) where.isFeatured = filter.featured;
    if (filter.excludeId) where.id = { not: filter.excludeId };
    if (filter.query) {
      where.OR = [
        { title: { contains: filter.query, mode: 'insensitive' } },
        { summary: { contains: filter.query, mode: 'insensitive' } },
        { description: { contains: filter.query, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}
