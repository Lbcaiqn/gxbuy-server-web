import { Controller, UseGuards, SetMetadata, Get, Req, Post, Body, Patch } from '@nestjs/common';
import { JwtGuard } from '@/common/guard/jwt.guard';
import { OrderService } from './order.service';
import { CreateOrderByIdDto } from './dto/create-order-by-id.dto';
import { CreateOrderByShopcartDto } from './dto/create-order-by-shopcart.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ValidatePipe } from '@/common/pipe/validate.pipe';
import { VarifyParamsQuery } from '@/tools/varifyParamsQuery';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller({
  path: 'order',
  version: '1',
})
@UseGuards(JwtGuard)
@ApiTags('订单相关接口')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/jwt/getOrderData')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '获取用户订单信息', description: '获取用户订单信息' })
  @ApiQuery({ name: 'feature', description: '特征信息', required: true, type: 'string' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: true, type: 'number' })
  @ApiQuery({ name: 'page', description: '页数', required: true, type: 'number' })
  @ApiBearerAuth()
  getOrderData(@Req() req) {
    if (!['all', 'wait_paid', 'wait_shipped', 'wait_receive', 'wait_comment'].includes(req.query.feature))
      req.query.feature = 'all';
    if (!VarifyParamsQuery.varifyPage(req.query.pageSize)) req.query.pageSize = 30;
    if (!VarifyParamsQuery.varifyPage(req.query.page)) req.query.page = 1;

    return this.orderService.getOrderData(req);
  }

  @Get('/jwt/getConfirmOrderData')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '获取确认订单信息', description: '获取确认订单信息' })
  @ApiQuery({ name: 'from', description: '单个商品还是购物车', required: true, type: 'string' })
  @ApiQuery({
    name: 'goodsSkuId',
    description: '如果是单个商品就需要sku的id，如果是购物车的商品就不需要任何参数',
    type: 'string',
  })
  @ApiBearerAuth()
  getConfirmOrderData(@Req() req) {
    return this.orderService.getConfirmOrderData(req);
  }

  @Post('/jwt/createOrderById')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '创建订单（单个商品）', description: '创建订单（单个商品）' })
  createOrderById(@Req() req, @Body(ValidatePipe) body: CreateOrderByIdDto) {
    return this.orderService.createOrderById(req, body);
  }

  @Post('/jwt/createOrderByShopcart')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '创建订单（购物车的商品）', description: '创建订单（购物车的商品）' })
  createOrderByShopcart(@Req() req, @Body(ValidatePipe) body: CreateOrderByShopcartDto) {
    return this.orderService.createOrderByShopcart(req, body);
  }

  @Get('/jwt/getPayInfo')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '支付请求', description: '支付请求' })
  @ApiQuery({ name: 'orderIds', description: '订单id数组', required: true, type: Array<string> })
  getPayInfo(@Req() req) {
    return this.orderService.getPayInfo(req);
  }

  @Get('/jwt/getPayState')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '支付状态', description: '支付状态' })
  @ApiQuery({ name: 'orderIds', description: '订单id数组', required: true, type: Array<string> })
  getPayState(@Req() req) {
    return this.orderService.getPayState(req);
  }

  @Patch('/jwt/completePay')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '完成交易', description: '完成交易' })
  completePay(@Req() req, @Body(ValidatePipe) body: UpdateOrderDto) {
    return this.orderService.completePay(req, body);
  }

  @Patch('/jwt/cancelOrder')
  @SetMetadata('jwt', true)
  @ApiOperation({ summary: '取消订单', description: '取消订单' })
  cancelOrader(@Req() req, @Body(ValidatePipe) body: UpdateOrderDto) {
    return this.orderService.cancelOrder(req, body);
  }
}
