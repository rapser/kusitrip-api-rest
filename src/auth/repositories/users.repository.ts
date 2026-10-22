import { User } from '@prisma/client';

export interface CreateUserData {
  name: string;
  surname: string;
  email: string;
  passwordHash: string;
}

/** Persistence port for users. Services depend on this, never on Prisma. */
export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(data: CreateUserData): Promise<User>;
}
