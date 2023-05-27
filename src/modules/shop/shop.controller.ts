import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopRegisterDto } from './dto/shop-register.dto';
import { ValidatePipe } from '@/common/pipe/validate.pipe';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller({
  path: 'shop',
  version: '1',
})
@ApiTags('商家相关接口')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('/getShopInfo/:id')
  @ApiOperation({ summary: '获取商家信息', description: '获取商家信息' })
  @ApiParam({ name: 'id', description: '商家id', required: true, type: 'string' })
  getShopInfo(@Req() req, @Param('id') id) {
    return this.shopService.getShopInfo(req, id);
  }

  @Post('/register')
  @ApiOperation({ summary: '商家注册', description: '商家注册' })
  register(@Req() req, @Body(ValidatePipe) registerInfo: ShopRegisterDto) {
    return this.shopService.register(req.session.code, registerInfo);
  }
}
