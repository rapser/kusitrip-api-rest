import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { FavoritesRepository } from './favorites.repository';
import { PrismaFavoritesRepository } from './prisma-favorites.repository';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  controllers: [FavoritesController],
  providers: [
    FavoritesService,
    { provide: FavoritesRepository, useClass: PrismaFavoritesRepository },
  ],
})
export class FavoritesModule {}
