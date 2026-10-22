import { Category } from '@prisma/client';
import { CategoryResponseDto } from './dto/category-response.dto';

export function toCategoryResponse(category: Category): CategoryResponseDto {
  return { id: category.id, name: category.name, icon: category.icon };
}
