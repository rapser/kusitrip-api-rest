import { Category } from '@prisma/client';

export abstract class CategoriesRepository {
  abstract findAll(): Promise<Category[]>;
}
