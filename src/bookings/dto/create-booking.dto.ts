import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString, Max, Min } from 'class-validator';

export const MAX_PEOPLE_PER_BOOKING = 20;

export class CreateBookingDto {
  @ApiProperty({ example: 'cusco-excursion-machu-picchu-entradas' })
  @IsString()
  activityId: string;

  @ApiProperty({
    example: '2026-12-15T09:00:00.000Z',
    description: 'ISO-8601 date and time of the activity',
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ example: 2, minimum: 1, maximum: MAX_PEOPLE_PER_BOOKING })
  @IsInt()
  @Min(1)
  @Max(MAX_PEOPLE_PER_BOOKING)
  numberOfPeople: number;
}
