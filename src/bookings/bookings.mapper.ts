import { BookingWithActivity } from './bookings.repository';
import { BookingResponseDto } from './dto/booking-response.dto';

export function toBookingResponse(
  booking: BookingWithActivity,
): BookingResponseDto {
  return {
    id: booking.id,
    bookingNumber: booking.number,
    activityId: booking.activityId,
    activityTitle: booking.activityTitle,
    activityImageUrl: booking.activity.imageUrls[0] ?? '',
    date: booking.activityDate.toISOString(),
    numberOfPeople: booking.numberOfPeople,
    unitPrice: Number(booking.unitPrice),
    totalPrice: Number(booking.totalPrice),
    currency: booking.currency,
    status: booking.status,
    confirmedAt: booking.createdAt.toISOString(),
  };
}
