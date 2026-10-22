import { Destination } from '@prisma/client';

export interface DestinationFilter {
  country?: string;
  query?: string;
}

export abstract class DestinationsRepository {
  abstract findMany(filter?: DestinationFilter): Promise<Destination[]>;
  abstract findById(id: string): Promise<Destination | null>;
}
