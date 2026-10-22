import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { CategoriesModule } from '../categories/categories.module';
import { DestinationsModule } from '../destinations/destinations.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [CategoriesModule, DestinationsModule, ActivitiesModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
