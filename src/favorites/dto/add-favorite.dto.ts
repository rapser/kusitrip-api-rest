import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ example: 'cusco-excursion-machu-picchu-entradas' })
  @IsString()
  activityId: string;
}
