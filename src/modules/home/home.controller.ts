import { Controller, Get, Param } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller({
  path: 'home',
  version: '1',
})
@ApiTags('公共数据相关接口')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('/getBannerData/:type')
  @ApiOperation({ summary: '获取轮播图数据', description: '获取轮播图数据' })
  @ApiParam({ name: 'id', type: String, description: 'PC端还是移动端', required: true })
  getBannerData(@Param('type') type) {
    return this.homeService.getBannerData(type);
  }

  @Get('/getRecommendData')
  @ApiOperation({ summary: '获取推荐信息数据', description: '获取推荐信息数据' })
  getRecommendData() {
    return this.homeService.getRecommendData();
  }

  @Get('/getFloorData')
  @ApiOperation({ summary: '获取底部信息数据', description: '获取底部信息数据' })
  getFloorData() {
    return this.homeService.getFloorData();
  }
}
