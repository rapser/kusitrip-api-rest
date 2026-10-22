import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home-response.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Home screen: categories, destinations and featured activities',
  })
  getHome(): Promise<HomeResponseDto> {
    return this.homeService.getHome();
  }
}
