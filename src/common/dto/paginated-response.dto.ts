import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMetaDto;
}
