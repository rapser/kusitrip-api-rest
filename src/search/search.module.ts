import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ActivitiesModule } from '../activities/activities.module';
import { DestinationsModule } from '../destinations/destinations.module';

@Module({
  imports: [ActivitiesModule, DestinationsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
