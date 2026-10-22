import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trimLowercase } from '../../common/transformers/string.transformers';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@kusitrip.com' })
  @Transform(trimLowercase)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'kusitrip123' })
  @IsString()
  @MinLength(1)
  password: string;
}
