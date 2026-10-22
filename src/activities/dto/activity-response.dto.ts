import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { PageMetaDto } from '../../common/dto/paginated-response.dto';

export class ActivityResponseDto {
  @ApiProperty({ example: 'cusco-excursion-machu-picchu-entradas' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ description: 'One-line teaser' })
  summary: string;

  @ApiProperty({ description: 'Long description, paragraphs split by \\n\\n' })
  description: string;

  @ApiProperty({ example: 331.74 })
  price: number;

  @ApiProperty({ nullable: true, type: Number })
  originalPrice: number | null;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 9.1, description: 'Score out of 10' })
  rating: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  travelerCount: number;

  @ApiProperty({ type: CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty()
  destinationId: string;

  @ApiProperty({ type: [String] })
  imageUrls: string[];

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty({ example: 'Español, Inglés' })
  language: string;

  @ApiProperty({ description: '0 when free cancellation is not offered' })
  freeCancellationDays: number;

  @ApiProperty()
  isFree: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  meetingPoint: string;

  @ApiProperty({ type: [String] })
  includes: string[];
}

export class ActivityPageResponseDto {
  @ApiProperty({ type: [ActivityResponseDto] })
  items: ActivityResponseDto[];

  @ApiProperty({ type: PageMetaDto })
  meta: PageMetaDto;
}
