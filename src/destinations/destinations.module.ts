import { Module } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { DestinationsRepository } from './destinations.repository';
import { PrismaDestinationsRepository } from './prisma-destinations.repository';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  controllers: [DestinationsController],
  providers: [
    DestinationsService,
    { provide: DestinationsRepository, useClass: PrismaDestinationsRepository },
  ],
  exports: [DestinationsService],
})
export class DestinationsModule {}
