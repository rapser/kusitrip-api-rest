import { Activity, Category } from '@prisma/client';

export type ActivityWithCategory = Activity & { category: Category };

export interface ActivityFilter {
  destinationId?: string;
  categoryId?: string;
  featured?: boolean;
  query?: string;
  excludeId?: string;
}

export interface PageRequest {
  skip: number;
  take: number;
}

export abstract class ActivitiesRepository {
  abstract findMany(
    filter: ActivityFilter,
    page?: PageRequest,
  ): Promise<ActivityWithCategory[]>;
  abstract count(filter: ActivityFilter): Promise<number>;
  abstract findById(id: string): Promise<ActivityWithCategory | null>;
}
