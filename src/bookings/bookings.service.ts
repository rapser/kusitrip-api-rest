import { HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { ApiException } from '../common/exceptions/api.exception';
import { ActivitiesService } from '../activities/activities.service';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { toBookingResponse } from './bookings.mapper';
import { generateBookingNumber } from './booking-number.util';

// Clients send local dates; allow up to a day of timezone skew.
const DATE_TOLERANCE_MS = 24 * 60 * 60 * 1000;
const MAX_NUMBER_ATTEMPTS = 5;

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookings: BookingsRepository,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    if (dto.date.getTime() < Date.now() - DATE_TOLERANCE_MS) {
      throw new ApiException(
        'BOOKING_DATE_IN_PAST',
        HttpStatus.UNPROCESSABLE_ENTITY,
        'validation_error',
        [{ field: 'date', code: 'in_past', message: dto.date.toISOString() }],
      );
    }

    // Price is always taken from the catalog, never trusted from the client.
    const activity = await this.activitiesService.findOne(dto.activityId);
    const totalPrice =
      Math.round(activity.price * dto.numberOfPeople * 100) / 100;

    const booking = await this.bookings.create({
      number: await this.uniqueBookingNumber(),
      userId,
      activityId: activity.id,
      activityTitle: activity.title,
      activityDate: dto.date,
      numberOfPeople: dto.numberOfPeople,
      unitPrice: activity.price,
      totalPrice,
      currency: activity.currency,
    });
    return toBookingResponse(booking);
  }

  async list(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookings.findByUser(userId);
    return bookings.map(toBookingResponse);
  }

  async findOne(userId: string, id: string): Promise<BookingResponseDto> {
    return toBookingResponse(await this.getOwned(userId, id));
  }

  async cancel(userId: string, id: string): Promise<BookingResponseDto> {
    const booking = await this.getOwned(userId, id);
    if (booking.status === BookingStatus.cancelled) {
      throw new ApiException(
        'BOOKING_ALREADY_CANCELLED',
        HttpStatus.CONFLICT,
        'conflict_error',
      );
    }
    const updated = await this.bookings.updateStatus(
      id,
      BookingStatus.cancelled,
    );
    return toBookingResponse(updated);
  }

  private async getOwned(userId: string, id: string) {
    const booking = await this.bookings.findByIdForUser(id, userId);
    if (!booking) {
      throw new ApiException(
        'BOOKING_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'not_found_error',
      );
    }
    return booking;
  }

  private async uniqueBookingNumber(): Promise<string> {
    for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt++) {
      const number = generateBookingNumber();
      if (!(await this.bookings.numberExists(number))) return number;
    }
    throw new Error('Could not generate a unique booking number');
  }
}
