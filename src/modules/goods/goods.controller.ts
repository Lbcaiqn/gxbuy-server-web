import { Controller, Get, Param, Req } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { VarifyParamsQuery } from '@/tools/varifyParamsQuery';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller({
  path: 'goods',
  version: '1',
})
@ApiTags('商品相关接口')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get('/search')
  @ApiOperation({
    summary: '搜索商品',
    description: '可以根据关键词或者分类id进行搜索',
  })
  @ApiQuery({ name: 'keyword', type: String, description: '关键词', required: true })
  @ApiQuery({ name: 'c1id', type: Number, description: '第一级分类id', required: true })
  @ApiQuery({ name: 'c2id', type: Number, description: '第二级分类id', required: true })
  @ApiQuery({ name: 'c3id', type: Number, description: '第三级分类id', required: true })
  @ApiQuery({ name: 'pageSize', type: Number, description: '每页数量', required: true })
  @ApiQuery({ name: 'page', type: Number, description: '页码', required: true })
  searchGoods(@Req() req) {
    if (!VarifyParamsQuery.varifyPage(req.query.pageSize)) req.query.pageSize = 30;
    if (!VarifyParamsQuery.varifyPage(req.query.page)) req.query.page = 1;

    return this.goodsService.searchGoods(req);
  }

  @Get('detail/:id')
  @ApiOperation({
    summary: '获取商品详情信息',
    description: '获取商品详情信息，因为后端的id是bigint类型，需要借助字符串处理',
  })
  @ApiParam({ name: '商品id', type: String, description: '商品id', required: true })
  getGoodsDetail(@Req() req, @Param('id') id) {
    return this.goodsService.getGoodsDetail(id, req);
  }

  @Get('/getGoodsByFeature')
  @ApiOperation({
    summary: '获取某种特征的商品列表',
    description: '获取热门、新品、流行的商品列表',
  })
  @ApiQuery({ name: 'feature', type: String, description: '商品特征', required: true })
  @ApiQuery({ name: 'pageSize', type: Number, description: '每页数量', required: true })
  @ApiQuery({ name: 'page', type: Number, description: '页码', required: true })
  getGoodsByFeature(@Req() req) {
    if (!['hot', 'new', 'pop'].includes(req.query.feature)) req.query.feature = 'hot';
    if (!VarifyParamsQuery.varifyPage(req.query.pageSize)) req.query.pageSize = 30;
    if (!VarifyParamsQuery.varifyPage(req.query.page)) req.query.page = 1;

    return this.goodsService.getGoodsByFeature(req);
  }

  @Get('/getGoodsByShop/:id')
  @ApiOperation({
    summary: '获取商家的商品',
    description: '获取商家的商品',
  })
  @ApiParam({ name: '商家id', type: String, description: '商家id', required: true })
  @ApiQuery({ name: 'pageSize', type: Number, description: '每页数量', required: true })
  @ApiQuery({ name: 'page', type: Number, description: '页码', required: true })
  getGoodsByShop(@Param('id') id, @Req() req) {
    if (!VarifyParamsQuery.varifyPage(req.query.pageSize)) req.query.pageSize = 30;
    if (!VarifyParamsQuery.varifyPage(req.query.page)) req.query.page = 1;

    return this.goodsService.getGoodsByShop(id, req);
  }

  @Get('/getGoodsComment/:id')
  @ApiOperation({
    summary: '获取商品评论',
    description: '获取商品评论',
  })
  @ApiParam({ name: '商品id', type: String, description: '商品id', required: true })
  @ApiQuery({ name: 'pageSize', type: Number, description: '每页数量', required: true })
  @ApiQuery({ name: 'page', type: Number, description: '页码', required: true })
  getGoodsComment(@Param('id') id, @Req() req) {
    if (!VarifyParamsQuery.varifyPage(req.query.pageSize)) req.query.pageSize = 30;
    if (!VarifyParamsQuery.varifyPage(req.query.page)) req.query.page = 1;

    return this.goodsService.getGoodsComment(id, req);
  }
}
