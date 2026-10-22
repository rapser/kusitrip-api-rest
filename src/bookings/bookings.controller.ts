import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Book an activity' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my bookings' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<BookingResponseDto[]> {
    return this.bookingsService.list(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my bookings' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(user.userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel one of my bookings' })
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(user.userId, id);
  }
}
