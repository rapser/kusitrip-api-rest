import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingWithActivity,
  BookingsRepository,
  CreateBookingData,
} from './bookings.repository';

const WITH_ACTIVITY = { activity: { select: { imageUrls: true } } } as const;

@Injectable()
export class PrismaBookingsRepository extends BookingsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(data: CreateBookingData): Promise<BookingWithActivity> {
    return this.prisma.booking.create({ data, include: WITH_ACTIVITY });
  }

  findByUser(userId: string): Promise<BookingWithActivity[]> {
    return this.prisma.booking.findMany({
      where: { userId },
      include: WITH_ACTIVITY,
      orderBy: { activityDate: 'desc' },
    });
  }

  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<BookingWithActivity | null> {
    return this.prisma.booking.findFirst({
      where: { id, userId },
      include: WITH_ACTIVITY,
    });
  }

  updateStatus(
    id: string,
    status: BookingStatus,
  ): Promise<BookingWithActivity> {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: WITH_ACTIVITY,
    });
  }

  async numberExists(number: string): Promise<boolean> {
    const booking = await this.prisma.booking.findUnique({
      where: { number },
      select: { id: true },
    });
    return booking !== null;
  }
}
