import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';
import { PrismaBookingsRepository } from './prisma-bookings.repository';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    { provide: BookingsRepository, useClass: PrismaBookingsRepository },
  ],
})
export class BookingsModule {}
