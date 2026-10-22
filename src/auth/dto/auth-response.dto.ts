import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ description: 'Access token lifetime in seconds' })
  expiresIn: number;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
