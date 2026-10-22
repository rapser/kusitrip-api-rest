import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import {
  ActivityPageResponseDto,
  ActivityResponseDto,
} from './dto/activity-response.dto';
import { ListActivitiesQueryDto } from './dto/list-activities-query.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List activities (paginated, filterable)' })
  @ApiOkResponse({ type: ActivityPageResponseDto })
  findPage(
    @Query() query: ListActivitiesQueryDto,
  ): Promise<ActivityPageResponseDto> {
    return this.activitiesService.findPage(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get activity detail' })
  findOne(@Param('id') id: string): Promise<ActivityResponseDto> {
    return this.activitiesService.findOne(id);
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({ summary: 'Other activities in the same destination' })
  findRelated(@Param('id') id: string): Promise<ActivityResponseDto[]> {
    return this.activitiesService.findRelated(id);
  }
}
