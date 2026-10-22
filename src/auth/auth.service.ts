import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import { User } from '@prisma/client';
import { ApiException } from '../common/exceptions/api.exception';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PasswordHasher } from './security/password-hasher';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { toUserProfile } from './auth.mapper';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Refresh tokens are long random JWTs, so a fast SHA-256 digest is enough
 * (and, unlike bcrypt, it hashes the whole token instead of the first 72 bytes).
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly hasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ApiException(
        'EMAIL_ALREADY_IN_USE',
        HttpStatus.CONFLICT,
        'conflict_error',
        [{ field: 'email', code: 'already_in_use', message: dto.email }],
      );
    }

    const user = await this.users.create({
      name: dto.name.trim(),
      surname: dto.surname.trim(),
      email: dto.email,
      passwordHash: await this.hasher.hash(dto.password),
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    const passwordMatches =
      user !== null &&
      (await this.hasher.compare(dto.password, user.passwordHash));
    if (!user || !passwordMatches) {
      throw new ApiException(
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
        'authentication_error',
      );
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw this.invalidRefreshToken();
    }

    const matchedTokenId = await this.findStoredTokenId(
      payload.sub,
      refreshToken,
    );
    const user = await this.users.findById(payload.sub);
    if (!matchedTokenId || !user) {
      throw this.invalidRefreshToken();
    }

    // Rotation: a refresh token can only be used once.
    await this.refreshTokens.revoke(matchedTokenId);
    return this.issueTokens(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const matchedTokenId = await this.findStoredTokenId(userId, refreshToken);
    if (matchedTokenId) {
      await this.refreshTokens.revoke(matchedTokenId);
    }
  }

  async me(userId: string): Promise<UserProfileDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new ApiException(
        'NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'not_found_error',
      );
    }
    return toUserProfile(user);
  }

  private async findStoredTokenId(
    userId: string,
    refreshToken: string,
  ): Promise<string | null> {
    const stored = await this.refreshTokens.findActive(
      userId,
      hashToken(refreshToken),
    );
    return stored?.id ?? null;
  }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: randomUUID() },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
      },
    );

    await this.refreshTokens.create(
      user.id,
      hashToken(refreshToken),
      new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: toUserProfile(user),
    };
  }

  private invalidRefreshToken(): ApiException {
    return new ApiException(
      'INVALID_REFRESH_TOKEN',
      HttpStatus.UNAUTHORIZED,
      'authentication_error',
    );
  }
}
