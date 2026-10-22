import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/exceptions/api.exception';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityResponseDto } from '../activities/dto/activity-response.dto';
import { toActivityResponse } from '../activities/activities.mapper';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favorites: FavoritesRepository,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async list(userId: string): Promise<ActivityResponseDto[]> {
    const activities = await this.favorites.findActivities(userId);
    return activities.map(toActivityResponse);
  }

  async add(
    userId: string,
    activityId: string,
  ): Promise<ActivityResponseDto[]> {
    await this.activitiesService.findOne(activityId);
    await this.favorites.add(userId, activityId);
    return this.list(userId);
  }

  async remove(
    userId: string,
    activityId: string,
  ): Promise<ActivityResponseDto[]> {
    if (!(await this.favorites.exists(userId, activityId))) {
      throw new ApiException(
        'FAVORITE_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'not_found_error',
      );
    }
    await this.favorites.remove(userId, activityId);
    return this.list(userId);
  }
}
