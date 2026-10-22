import { Injectable } from '@nestjs/common';
import { Destination, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DestinationFilter,
  DestinationsRepository,
} from './destinations.repository';

@Injectable()
export class PrismaDestinationsRepository extends DestinationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findMany(filter: DestinationFilter = {}): Promise<Destination[]> {
    const where: Prisma.DestinationWhereInput = {};
    if (filter.country) {
      where.country = { equals: filter.country, mode: 'insensitive' };
    }
    if (filter.query) {
      where.OR = [
        { name: { contains: filter.query, mode: 'insensitive' } },
        { country: { contains: filter.query, mode: 'insensitive' } },
        { description: { contains: filter.query, mode: 'insensitive' } },
      ];
    }
    return this.prisma.destination.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  findById(id: string): Promise<Destination | null> {
    return this.prisma.destination.findUnique({ where: { id } });
  }
}
