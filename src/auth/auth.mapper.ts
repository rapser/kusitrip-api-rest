import { User } from '@prisma/client';
import { UserProfileDto } from './dto/user-profile.dto';

export function toUserProfile(user: User): UserProfileDto {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    memberSince: user.memberSince.toISOString(),
  };
}
