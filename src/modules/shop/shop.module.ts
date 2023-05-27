import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ShopManager } from './entities/shop_manager.entity';
import { ShopManagerRole } from './entities/shop_manager_role.entity';
import { User } from '../user/entities/user.entity';
import { UserFollow } from '../user/entities/user_follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, ShopManager, ShopManagerRole, User, UserFollow])],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
