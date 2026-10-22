import { RefreshToken } from '@prisma/client';

/** Persistence port for hashed refresh tokens. */
export abstract class RefreshTokensRepository {
  abstract create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  abstract findActive(
    userId: string,
    tokenHash: string,
  ): Promise<RefreshToken | null>;
  abstract revoke(id: string): Promise<void>;
}
