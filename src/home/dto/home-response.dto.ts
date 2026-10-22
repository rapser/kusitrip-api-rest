import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { DestinationResponseDto } from '../../destinations/dto/destination-response.dto';
import { ActivityResponseDto } from '../../activities/dto/activity-response.dto';

export class HomeResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  categories: CategoryResponseDto[];

  @ApiProperty({ type: [DestinationResponseDto] })
  destinations: DestinationResponseDto[];

  @ApiProperty({ type: [ActivityResponseDto] })
  featuredActivities: ActivityResponseDto[];
}
