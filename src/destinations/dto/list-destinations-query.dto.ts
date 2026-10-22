import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListDestinationsQueryDto {
  @ApiPropertyOptional({ example: 'Perú' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;

  @ApiPropertyOptional({ description: 'Free-text filter on name/country' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}
