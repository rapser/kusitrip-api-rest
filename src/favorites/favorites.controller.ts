import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { ActivityResponseDto } from '../activities/dto/activity-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List wishlist activities' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<ActivityResponseDto[]> {
    return this.favoritesService.list(user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add an activity to the wishlist' })
  add(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddFavoriteDto,
  ): Promise<ActivityResponseDto[]> {
    return this.favoritesService.add(user.userId, dto.activityId);
  }

  @Delete(':activityId')
  @ApiOperation({ summary: 'Remove an activity from the wishlist' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
  ): Promise<ActivityResponseDto[]> {
    return this.favoritesService.remove(user.userId, activityId);
  }
}
