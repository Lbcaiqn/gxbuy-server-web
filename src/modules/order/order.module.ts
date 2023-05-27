import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderInformation } from './entities/order_information.entity';
import { OrderItem } from './entities/order_item.entity';
import { User } from '../user/entities/user.entity';
import { GoodsSku } from '../goods/entities/goods_sku.entity';
import { GoodsSpu } from '../goods/entities/goods_spu.entity';
import { Shop } from '../shop/entities/shop.entity';
import { Shopcart } from '../shopcart/entities/shopcart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderInformation, OrderItem, User, GoodsSku, GoodsSpu, Shop, Shopcart])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
