import { ActivityWithCategory } from '../activities/activities.repository';

export abstract class FavoritesRepository {
  abstract findActivities(userId: string): Promise<ActivityWithCategory[]>;
  abstract exists(userId: string, activityId: string): Promise<boolean>;
  abstract add(userId: string, activityId: string): Promise<void>;
  abstract remove(userId: string, activityId: string): Promise<void>;
}
