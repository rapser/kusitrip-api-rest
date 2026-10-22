import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { DestinationsService } from '../destinations/destinations.service';
import { ActivitiesService } from '../activities/activities.service';
import { HomeResponseDto } from './dto/home-response.dto';

const FEATURED_LIMIT = 10;

/** Aggregates the Home screen in one round trip (BFF-style endpoint). */
@Injectable()
export class HomeService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly destinationsService: DestinationsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async getHome(): Promise<HomeResponseDto> {
    const [categories, destinations, featuredActivities] = await Promise.all([
      this.categoriesService.findAll(),
      this.destinationsService.findAll(),
      this.activitiesService.findFeatured(FEATURED_LIMIT),
    ]);
    return { categories, destinations, featuredActivities };
  }
}
