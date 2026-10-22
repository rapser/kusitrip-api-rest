import { BookingStatus } from '@prisma/client';
import { ApiException } from '../common/exceptions/api.exception';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityResponseDto } from '../activities/dto/activity-response.dto';
import { BookingsService } from './bookings.service';
import {
  BookingWithActivity,
  BookingsRepository,
  CreateBookingData,
} from './bookings.repository';

class InMemoryBookingsRepository extends BookingsRepository {
  readonly rows: BookingWithActivity[] = [];

  create(data: CreateBookingData): Promise<BookingWithActivity> {
    const now = new Date();
    const row = {
      ...data,
      id: `b${this.rows.length + 1}`,
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      status: BookingStatus.confirmed,
      createdAt: now,
      updatedAt: now,
      activity: { imageUrls: ['https://example.com/a.jpg'] },
    } as unknown as BookingWithActivity;
    this.rows.push(row);
    return Promise.resolve(row);
  }

  findByUser(userId: string): Promise<BookingWithActivity[]> {
    return Promise.resolve(this.rows.filter((r) => r.userId === userId));
  }

  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<BookingWithActivity | null> {
    return Promise.resolve(
      this.rows.find((r) => r.id === id && r.userId === userId) ?? null,
    );
  }

  updateStatus(
    id: string,
    status: BookingStatus,
  ): Promise<BookingWithActivity> {
    const row = this.rows.find((r) => r.id === id)!;
    row.status = status;
    return Promise.resolve(row);
  }

  numberExists(number: string): Promise<boolean> {
    return Promise.resolve(this.rows.some((r) => r.number === number));
  }
}

const activity = {
  id: 'cusco-free-tour-cusco',
  title: 'Free tour por Cusco',
  price: 34.23,
  currency: 'USD',
} as ActivityResponseDto;

describe('BookingsService', () => {
  let repository: InMemoryBookingsRepository;
  let service: BookingsService;
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  beforeEach(() => {
    repository = new InMemoryBookingsRepository();
    const activities = {
      findOne: jest.fn().mockResolvedValue(activity),
    } as unknown as ActivitiesService;
    service = new BookingsService(repository, activities);
  });

  it('prices the booking from the catalog, not from the client', async () => {
    const booking = await service.create('u1', {
      activityId: activity.id,
      date: tomorrow,
      numberOfPeople: 3,
    });

    expect(booking.unitPrice).toBe(34.23);
    expect(booking.totalPrice).toBe(102.69);
    expect(booking.bookingNumber).toMatch(/^KUSI-\d{6}$/);
    expect(booking.status).toBe('confirmed');
  });

  it('rejects dates in the past', async () => {
    await expect(
      service.create('u1', {
        activityId: activity.id,
        date: new Date('2020-01-01'),
        numberOfPeople: 1,
      }),
    ).rejects.toMatchObject({ code: 'BOOKING_DATE_IN_PAST' });
  });

  it('does not let a user see or cancel bookings of someone else', async () => {
    const booking = await service.create('owner', {
      activityId: activity.id,
      date: tomorrow,
      numberOfPeople: 1,
    });

    await expect(service.cancel('intruder', booking.id)).rejects.toBeInstanceOf(
      ApiException,
    );
    expect((await service.cancel('owner', booking.id)).status).toBe(
      'cancelled',
    );
    await expect(service.cancel('owner', booking.id)).rejects.toMatchObject({
      code: 'BOOKING_ALREADY_CANCELLED',
    });
  });
});
