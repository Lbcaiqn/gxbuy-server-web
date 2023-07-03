import { Module } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { GoodsController } from './goods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsSpu } from './entities/goods_spu.entity';
import { GoodsSku } from './entities/goods_sku.entity';
import { GoodsImg } from './entities/goods_img.entity';
import { GoodsAttribute } from './entities/goods_attribute.entity';
import { GoodsComment } from './entities/goods_comment.entity';
import { User } from '../user/entities/user.entity';
import { UserFavorite } from '../user/entities/user_favorite.entity';
import { UserFollow } from '../user/entities/user_follow.entity';
import { UserBrowseHistory } from '../user/entities/user_browse_history.entity';
import { UserSearchHistory } from '../user/entities/user_search_history.entity';
import { OrderItem } from '../order/entities/order_item.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      GoodsSpu,
      GoodsSku,
      GoodsImg,
      GoodsAttribute,
      GoodsComment,
      User,
      UserFavorite,
      UserFollow,
      UserBrowseHistory,
      UserSearchHistory,
      OrderItem,
    ]),
  ],
  controllers: [GoodsController],
  providers: [GoodsService],
})
export class GoodsModule {}
