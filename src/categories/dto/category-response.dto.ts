import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'excursions' })
  id: string;

  @ApiProperty({ example: 'Excursiones' })
  name: string;

  @ApiProperty({ example: 'bus', description: 'SF Symbol name' })
  icon: string;
}
