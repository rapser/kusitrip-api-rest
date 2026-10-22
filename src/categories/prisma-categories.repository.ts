import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class PrismaCategoriesRepository extends CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }
}
