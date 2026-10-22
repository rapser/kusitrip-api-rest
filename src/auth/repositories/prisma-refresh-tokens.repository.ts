import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Injectable()
export class PrismaRefreshTokensRepository extends RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  findActive(userId: string, tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }
}
