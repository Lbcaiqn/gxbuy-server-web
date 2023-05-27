import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopcartService } from './shopcart.service';
import { ShopcartController } from './shopcart.controller';
import { Shopcart } from './entities/shopcart.entity';
import { User } from '../user/entities/user.entity';
import { GoodsSpu } from '../goods/entities/goods_spu.entity';
import { GoodsSku } from '../goods/entities/goods_sku.entity';
import { Shop } from '../shop/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shopcart, User, GoodsSpu, GoodsSku, Shop])],
  controllers: [ShopcartController],
  providers: [ShopcartService],
})
export class ShopcartModule {}
