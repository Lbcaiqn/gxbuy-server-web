import { Module } from '@nestjs/common';
import { GoodsModule } from './modules/goods/goods.module';
import { UserModule } from './modules/user/user.module';
import { HomeModule } from './modules/home/home.module';
import { ShopcartModule } from './modules/shopcart/shopcart.module';
import { CategoryModule } from './modules/category/category.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopModule } from './modules/shop/shop.module';
import { OrderModule } from './modules/order/order.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    GoodsModule,
    UserModule,
    HomeModule,
    ShopcartModule,
    CategoryModule,
    ShopModule,
    OrderModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      username: 'root',
      password: 'Lgx123456@@',
      host: 'localhost',
      port: 3306,
      database: 'gxbuy',
      // synchronize: true,
      retryDelay: 500,
      retryAttempts: 10,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
