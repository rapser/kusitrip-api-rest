import { ApiProperty } from '@nestjs/swagger';

export class DestinationResponseDto {
  @ApiProperty({ example: 'cusco' })
  id: string;

  @ApiProperty({ example: 'Cusco' })
  name: string;

  @ApiProperty({ example: 'Perú' })
  country: string;

  @ApiProperty({ example: 'América' })
  continent: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  activityCount: number;

  @ApiProperty()
  travelerCount: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty({ example: 8.8, description: 'Score out of 10' })
  rating: number;

  @ApiProperty()
  description: string;
}
