import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryResponseDto } from './dto/category-response.dto';
import { toCategoryResponse } from './categories.mapper';

@Injectable()
export class CategoriesService {
  constructor(private readonly categories: CategoriesRepository) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categories.findAll();
    return categories.map(toCategoryResponse);
  }
}
