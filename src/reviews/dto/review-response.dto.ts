import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  activityId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  city: string;

  @ApiProperty({ example: 9.5, description: 'Score out of 10' })
  rating: number;

  @ApiProperty()
  comment: string;

  @ApiProperty({
    example: 'pareja',
    enum: ['', 'pareja', 'familia', 'amigos', 'solo'],
  })
  travelType: string;

  @ApiProperty({ description: 'ISO-8601 date' })
  publishedAt: string;
}
