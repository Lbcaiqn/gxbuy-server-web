import { Controller, UseGuards, SetMetadata, Get, Post, Req, Body, Patch, Delete } from '@nestjs/common';
import { ShopcartService } from './shopcart.service';
import { ShopcartInsertDto } from './dto/shopcart-insert.dto';
import { JwtGuard } from '@/common/guard/jwt.guard';
import { ValidatePipe } from '@/common/pipe/validate.pipe';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShopcartUpdateAllSelectedDto } from './dto/shopcart-update-all-selected.dto';
import { ShopcartUpdateSingleStateDto } from './dto/shopcart-update-single-state.dto';
import { ShopcartUpdateGoodsSkuDto } from './dto/shopcart-update-goods-sku.dto';
@Controller({
  path: 'shopcart',
  version: '1',
})
@UseGuards(JwtGuard)
@ApiTags('购物车相关接口')
export class ShopcartController {
  constructor(private readonly shopcartService: ShopcartService) {}

  @Post('/jwt/insert')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '插入购物车数据', description: '插入购物车数据' })
  insertShopcartData(@Req() req, @Body(ValidatePipe) body: ShopcartInsertDto) {
    return this.shopcartService.insertShopcartData(req, body);
  }

  @Get('/jwt/getShopcartData')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '获取购物车数据', description: '获取购物车数据' })
  getShopcartData(@Req() req) {
    return this.shopcartService.getShopcartData(req);
  }

  @Patch('/jwt/updateSingleState')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '修改单个购物车数据', description: '修改单个购物车数据' })
  updateSingleState(@Req() req, @Body(ValidatePipe) body: ShopcartUpdateSingleStateDto) {
    return this.shopcartService.updateSingleState(req, body);
  }

  @Patch('/jwt/updateAllSelected')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '全选与取消全选所有/某个商家商品', description: '全选与取消全选所有/某个商家商品' })
  updateAllSelected(@Req() req, @Body(ValidatePipe) body: ShopcartUpdateAllSelectedDto) {
    return this.shopcartService.updateAllSelected(req, body);
  }

  @Patch('/jwt/updateGoodsSku')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '修改sku', description: '修改sku' })
  updateGoodsSku(@Req() req, @Body(ValidatePipe) body: ShopcartUpdateGoodsSkuDto) {
    return this.shopcartService.updateGoodsSku(req, body);
  }

  @Delete('jwt/deleteSingle/:goods_sku_id')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '删除单条数据', description: '删除单条数据' })
  @ApiParam({ name: '用户goods_sku_id', required: true, type: String, description: 'sku的id' })
  deleteSingle(@Req() req) {
    return this.shopcartService.deleteSingle(req);
  }

  @Delete('jwt/deleteAll')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '清空购物车', description: '清空购物车' })
  deleteAll(@Req() req) {
    return this.shopcartService.deleteAll(req);
  }
}
