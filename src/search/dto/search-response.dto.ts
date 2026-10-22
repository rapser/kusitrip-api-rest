import { ApiProperty } from '@nestjs/swagger';
import { ActivityResponseDto } from '../../activities/dto/activity-response.dto';
import { DestinationResponseDto } from '../../destinations/dto/destination-response.dto';

export class SearchResponseDto {
  @ApiProperty({ type: [ActivityResponseDto] })
  activities: ActivityResponseDto[];

  @ApiProperty({ type: [DestinationResponseDto] })
  destinations: DestinationResponseDto[];
}
