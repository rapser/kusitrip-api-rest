import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersRepository } from './repositories/users.repository';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PrismaRefreshTokensRepository } from './repositories/prisma-refresh-tokens.repository';
import { PasswordHasher } from './security/password-hasher';
import { BcryptPasswordHasher } from './security/bcrypt-password-hasher';

@Module({
  // Secrets and TTLs are passed per call in AuthService.issueTokens.
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    {
      provide: RefreshTokensRepository,
      useClass: PrismaRefreshTokensRepository,
    },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
  exports: [AuthService, UsersRepository],
})
export class AuthModule {}
