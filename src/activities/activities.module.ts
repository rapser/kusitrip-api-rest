import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { PrismaActivitiesRepository } from './prisma-activities.repository';

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    { provide: ActivitiesRepository, useClass: PrismaActivitiesRepository },
  ],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
