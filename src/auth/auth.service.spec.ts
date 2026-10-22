import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import { AuthService } from './auth.service';
import {
  CreateUserData,
  UsersRepository,
} from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PasswordHasher } from './security/password-hasher';

class InMemoryUsers extends UsersRepository {
  readonly rows: User[] = [];
  findById(id: string) {
    return Promise.resolve(this.rows.find((u) => u.id === id) ?? null);
  }
  findByEmail(email: string) {
    return Promise.resolve(this.rows.find((u) => u.email === email) ?? null);
  }
  create(data: CreateUserData) {
    const now = new Date();
    const user: User = {
      ...data,
      id: `u${this.rows.length + 1}`,
      memberSince: now,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.push(user);
    return Promise.resolve(user);
  }
}

class InMemoryRefreshTokens extends RefreshTokensRepository {
  readonly rows: RefreshToken[] = [];
  create(userId: string, tokenHash: string, expiresAt: Date) {
    this.rows.push({
      id: `t${this.rows.length + 1}`,
      userId,
      tokenHash,
      expiresAt,
      revoked: false,
      createdAt: new Date(),
    });
    return Promise.resolve();
  }
  findActive(userId: string, tokenHash: string) {
    return Promise.resolve(
      this.rows.find(
        (t) => t.userId === userId && t.tokenHash === tokenHash && !t.revoked,
      ) ?? null,
    );
  }
  revoke(id: string) {
    this.rows.find((t) => t.id === id)!.revoked = true;
    return Promise.resolve();
  }
}

class PlainHasher extends PasswordHasher {
  hash(plain: string) {
    return Promise.resolve(`hashed:${plain}`);
  }
  compare(plain: string, hash: string) {
    return Promise.resolve(hash === `hashed:${plain}`);
  }
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    const config = {
      getOrThrow: (key: string) =>
        key === 'JWT_SECRET' ? 'access-secret' : 'refresh-secret',
    } as unknown as ConfigService;
    service = new AuthService(
      new InMemoryUsers(),
      new InMemoryRefreshTokens(),
      new PlainHasher(),
      new JwtService({}),
      config,
    );
  });

  const register = () =>
    service.register({
      name: 'Rosa',
      surname: 'Quispe',
      email: 'rosa@kusitrip.com',
      password: 'secreto123',
    });

  it('registers and logs in', async () => {
    const registered = await register();
    expect(registered.user.surname).toBe('Quispe');

    const session = await service.login({
      email: 'rosa@kusitrip.com',
      password: 'secreto123',
    });
    expect(session.accessToken).toBeDefined();
  });

  it('rejects a wrong password and duplicate emails', async () => {
    await register();
    await expect(
      service.login({ email: 'rosa@kusitrip.com', password: 'nope' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    await expect(register()).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_IN_USE',
    });
  });

  it('rotates refresh tokens: an old token cannot be reused', async () => {
    const { refreshToken } = await register();

    const rotated = await service.refresh(refreshToken);
    expect(rotated.refreshToken).not.toBe(refreshToken);

    await expect(service.refresh(refreshToken)).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    });
    await expect(service.refresh(rotated.refreshToken)).resolves.toBeDefined();
  });
});
