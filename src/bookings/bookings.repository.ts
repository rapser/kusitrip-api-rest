import { Activity, Booking, BookingStatus } from '@prisma/client';

export type BookingWithActivity = Booking & {
  activity: Pick<Activity, 'imageUrls'>;
};

export interface CreateBookingData {
  number: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  activityDate: Date;
  numberOfPeople: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
}

export abstract class BookingsRepository {
  abstract create(data: CreateBookingData): Promise<BookingWithActivity>;
  abstract findByUser(userId: string): Promise<BookingWithActivity[]>;
  abstract findByIdForUser(
    id: string,
    userId: string,
  ): Promise<BookingWithActivity | null>;
  abstract updateStatus(
    id: string,
    status: BookingStatus,
  ): Promise<BookingWithActivity>;
  abstract numberExists(number: string): Promise<boolean>;
}
