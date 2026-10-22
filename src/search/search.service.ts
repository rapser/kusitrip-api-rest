import { Injectable } from '@nestjs/common';
import { ActivitiesService } from '../activities/activities.service';
import { DestinationsService } from '../destinations/destinations.service';
import { SearchResponseDto } from './dto/search-response.dto';

const ACTIVITY_RESULTS_LIMIT = 30;

@Injectable()
export class SearchService {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly destinationsService: DestinationsService,
  ) {}

  async search(query: string): Promise<SearchResponseDto> {
    const [activities, destinations] = await Promise.all([
      this.activitiesService.search(query, ACTIVITY_RESULTS_LIMIT),
      this.destinationsService.findAll({ q: query }),
    ]);
    return { activities, destinations };
  }
}
