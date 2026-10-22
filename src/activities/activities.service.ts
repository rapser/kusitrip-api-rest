import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/exceptions/api.exception';
import { Paginated } from '../common/dto/paginated-response.dto';
import { ActivitiesRepository } from './activities.repository';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ListActivitiesQueryDto } from './dto/list-activities-query.dto';
import { toActivityResponse } from './activities.mapper';

const RELATED_LIMIT = 4;

@Injectable()
export class ActivitiesService {
  constructor(private readonly activities: ActivitiesRepository) {}

  async findPage(
    query: ListActivitiesQueryDto,
  ): Promise<Paginated<ActivityResponseDto>> {
    const filter = {
      destinationId: query.destinationId,
      categoryId: query.category,
      featured: query.featured,
      query: query.q?.trim() || undefined,
    };
    const skip = (query.page - 1) * query.limit;
    const [activities, total] = await Promise.all([
      this.activities.findMany(filter, { skip, take: query.limit }),
      this.activities.count(filter),
    ]);
    return {
      items: activities.map(toActivityResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: skip + activities.length < total,
      },
    };
  }

  async findOne(id: string): Promise<ActivityResponseDto> {
    const activity = await this.activities.findById(id);
    if (!activity) {
      throw new ApiException(
        'ACTIVITY_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'not_found_error',
      );
    }
    return toActivityResponse(activity);
  }

  async findRelated(id: string): Promise<ActivityResponseDto[]> {
    const activity = await this.findOne(id);
    const related = await this.activities.findMany(
      { destinationId: activity.destinationId, excludeId: id },
      { skip: 0, take: RELATED_LIMIT },
    );
    return related.map(toActivityResponse);
  }

  async findByDestination(
    destinationId: string,
    categoryId?: string,
  ): Promise<ActivityResponseDto[]> {
    const activities = await this.activities.findMany({
      destinationId,
      categoryId,
    });
    return activities.map(toActivityResponse);
  }

  async findFeatured(limit: number): Promise<ActivityResponseDto[]> {
    const activities = await this.activities.findMany(
      { featured: true },
      { skip: 0, take: limit },
    );
    return activities.map(toActivityResponse);
  }

  async search(query: string, limit: number): Promise<ActivityResponseDto[]> {
    const activities = await this.activities.findMany(
      { query },
      { skip: 0, take: limit },
    );
    return activities.map(toActivityResponse);
  }
}
