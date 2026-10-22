import { ApiProperty } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'KUSI-482913' })
  bookingNumber: string;

  @ApiProperty()
  activityId: string;

  @ApiProperty()
  activityTitle: string;

  @ApiProperty()
  activityImageUrl: string;

  @ApiProperty({ description: 'ISO-8601 date and time of the activity' })
  date: string;

  @ApiProperty()
  numberOfPeople: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ enum: ['confirmed', 'cancelled'] })
  status: string;

  @ApiProperty({ description: 'ISO-8601 timestamp the booking was confirmed' })
  confirmedAt: string;
}
