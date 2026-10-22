import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';
import { DestinationResponseDto } from './dto/destination-response.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';
import { ActivityResponseDto } from '../activities/dto/activity-response.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List destinations' })
  findAll(
    @Query() query: ListDestinationsQueryDto,
  ): Promise<DestinationResponseDto[]> {
    return this.destinationsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get destination detail' })
  findOne(@Param('id') id: string): Promise<DestinationResponseDto> {
    return this.destinationsService.findOne(id);
  }

  @Public()
  @Get(':id/activities')
  @ApiOperation({ summary: 'List the activities of a destination' })
  @ApiQuery({ name: 'category', required: false, example: 'excursions' })
  findActivities(
    @Param('id') id: string,
    @Query('category') category?: string,
  ): Promise<ActivityResponseDto[]> {
    return this.destinationsService.findActivities(id, category);
  }
}
