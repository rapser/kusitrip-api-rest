import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/exceptions/api.exception';
import { DestinationsRepository } from './destinations.repository';
import { DestinationResponseDto } from './dto/destination-response.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';
import { toDestinationResponse } from './destinations.mapper';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityResponseDto } from '../activities/dto/activity-response.dto';

@Injectable()
export class DestinationsService {
  constructor(
    private readonly destinations: DestinationsRepository,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findAll(
    query: ListDestinationsQueryDto = {},
  ): Promise<DestinationResponseDto[]> {
    const destinations = await this.destinations.findMany({
      country: query.country,
      query: query.q?.trim() || undefined,
    });
    return destinations.map(toDestinationResponse);
  }

  async findOne(id: string): Promise<DestinationResponseDto> {
    const destination = await this.destinations.findById(id);
    if (!destination) {
      throw new ApiException(
        'DESTINATION_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'not_found_error',
      );
    }
    return toDestinationResponse(destination);
  }

  async findActivities(
    id: string,
    categoryId?: string,
  ): Promise<ActivityResponseDto[]> {
    await this.findOne(id);
    return this.activitiesService.findByDestination(id, categoryId);
  }
}
