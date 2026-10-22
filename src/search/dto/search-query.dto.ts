import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trim } from '../../common/transformers/string.transformers';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'machu picchu', minLength: 2 })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  q: string;
}
