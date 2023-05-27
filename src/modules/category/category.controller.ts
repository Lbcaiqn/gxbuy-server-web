import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller({
  path: 'category',
  version: '1',
})
@ApiTags('分类相关接口')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('getCategoryData')
  @ApiOperation({ summary: '获取分类列表', description: '三级分类信息' })
  getCategoryData() {
    return this.categoryService.getCategoryData();
  }
}
