import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityWithCategory } from '../activities/activities.repository';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class PrismaFavoritesRepository extends FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActivities(userId: string): Promise<ActivityWithCategory[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { activity: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((favorite) => favorite.activity);
  }

  async exists(userId: string, activityId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_activityId: { userId, activityId } },
      select: { id: true },
    });
    return favorite !== null;
  }

  async add(userId: string, activityId: string): Promise<void> {
    await this.prisma.favorite.upsert({
      where: { userId_activityId: { userId, activityId } },
      update: {},
      create: { userId, activityId },
    });
  }

  async remove(userId: string, activityId: string): Promise<void> {
    await this.prisma.favorite.delete({
      where: { userId_activityId: { userId, activityId } },
    });
  }
}
