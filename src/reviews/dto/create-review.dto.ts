import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const TRAVEL_TYPES = ['pareja', 'familia', 'amigos', 'solo'] as const;

export class CreateReviewDto {
  @ApiProperty({ example: 9.5, minimum: 0, maximum: 10 })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  rating: number;

  @ApiProperty({ example: 'Una experiencia increíble, el guía fue excelente.' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;

  @ApiPropertyOptional({ example: 'Lima, Perú' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ enum: TRAVEL_TYPES })
  @IsOptional()
  @IsIn(TRAVEL_TYPES)
  travelType?: (typeof TRAVEL_TYPES)[number];
}
