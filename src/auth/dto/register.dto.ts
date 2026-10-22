import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trimLowercase } from '../../common/transformers/string.transformers';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Miguel' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'Tomairo' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  surname: string;

  @ApiProperty({ example: 'usuario@kusitrip.com' })
  @Transform(trimLowercase)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'kusitrip123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
