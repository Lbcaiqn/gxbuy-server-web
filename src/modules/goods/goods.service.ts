import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository, Like } from 'typeorm';
import { GoodsSpu } from './entities/goods_spu.entity';
import { User } from '../user/entities/user.entity';
import { UserFavorite } from '../user/entities/user_favorite.entity';
import { UserFollow } from '../user/entities/user_follow.entity';
import { UserBrowseHistory } from '../user/entities/user_browse_history.entity';
import { UserSearchHistory } from '../user/entities/user_search_history.entity';
import { OrderItem } from '../order/entities/order_item.entity';
import { verify } from 'jsonwebtoken';
import { SECRCT } from '@/common/secrct';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(GoodsSpu) private readonly goodsSpuRepository: Repository<GoodsSpu>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserFavorite) private readonly userFavoriteRepository: Repository<UserFavorite>,
    @InjectRepository(UserFollow) private readonly userFollowRepository: Repository<UserFollow>,
    @InjectRepository(UserBrowseHistory) private readonly userBrowseHistoryRepository: Repository<UserBrowseHistory>,
    @InjectRepository(UserSearchHistory) private readonly userSearchHistoryRepository: Repository<UserSearchHistory>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>
  ) {}

  async searchGoods(req: Request) {
    const { keyword, c1id, c2id, c3id, pageSize, page } = req.query as any;

    const where: any = {};

    if (keyword) where.goods_spu_name = Like(`%${keyword}%`);
    if (c1id) where.c1id = c1id;
    if (c2id) where.c2id = c2id;
    if (c3id) where.c3id = c3id;

    const data = await this.goodsSpuRepository.findAndCount({
      relations: ['shop'],
      where,
      skip: (page - 1) * pageSize || 0,
      take: pageSize || 30,
    });

    // 如果目前是登录状态，就异步保存搜索记录
    let user_id: string | null = null;
    try {
      user_id = (verify(req.headers.authorization, SECRCT) as any)._id;
    } catch (err) {
      user_id = null;
    }

    if (user_id && keyword) {
      this.userRepository.findOne({ where: { _id: user_id } }).then(user => {
        if (user) {
          const userSearchHistory = new UserSearchHistory();
          userSearchHistory.keyword = keyword;
          userSearchHistory.user = user;
          this.userSearchHistoryRepository.save(userSearchHistory);
        }
      });
    }

    const res = {
      total: data[1],
      data: data[0],
    };

    return res;
  }

  async getGoodsDetail(id: string, req: Request) {
    const data = await this.goodsSpuRepository.findOne({
      where: { _id: id },
      relations: ['shop', 'goods_sku', 'goods_img', 'goods_attribute', 'goods_attribute.attribute'],
    });

    if (!data) throw new HttpException('商品不存在', HttpStatus.BAD_REQUEST);

    const resData = { ...data, isFavorite: false, isFollow: false };

    // 如果目前是登录状态，就查看是否是收藏的商品和关注的商家，并异步保存浏览记录
    let user_id: string | null = null;
    try {
      user_id = (verify(req.headers.authorization, SECRCT) as any)._id;
    } catch (err) {
      user_id = null;
    }
    if (user_id) {
      const user = await this.userRepository.findOne({ where: { _id: user_id } });
      if (user) {
        const userFavorite = await this.userFavoriteRepository
          .createQueryBuilder('user_favorite')
          .where('user_id = :uid', { uid: user_id })
          .andWhere('goods_spu_id = :gid', { gid: resData._id })
          .getOne();

        const userFollow = await this.userFollowRepository
          .createQueryBuilder('user_follow')
          .where('user_id = :uid', { uid: user_id })
          .andWhere('shop_id = :sid', { sid: resData.shop._id })
          .getOne();

        if (userFavorite) resData.isFavorite = true;
        if (userFollow) resData.isFollow = true;

        const userBrowseHistory = new UserBrowseHistory();
        userBrowseHistory.user = user;
        userBrowseHistory.goods_spu = data;
        this.userBrowseHistoryRepository.save(userBrowseHistory);
      }
    }

    return resData;
  }

  async getGoodsByFeature(req: Request) {
    const { feature, pageSize, page } = req.query as any;

    const order: any = {};
    if (feature === 'hot') order.goods_sku_total_sales = 'desc';
    else if (feature === 'new') order.add_time = 'desc';
    else if (feature === 'pop') order.goods_spu_total_favorite = 'desc';

    const data = await this.goodsSpuRepository.find({
      relations: ['shop'],
      skip: (page - 1) * pageSize || 0,
      take: pageSize || 30,
      order,
    });

    return data;
  }

  async getGoodsByShop(id: string, req: Request) {
    const { pageSize, page } = req.query as any;

    const data = await this.goodsSpuRepository.findAndCount({
      relations: ['shop'],
      where: { shop_id: id },
      skip: (page - 1) * pageSize || 0,
      take: pageSize || 30,
    });

    return {
      total: data[1],
      data: data[0],
    };
  }

  async getGoodsComment(id: string, req: Request) {
    const { pageSize, page } = req.query as any;

    const data = await this.orderItemRepository.findAndCount({
      relations: ['user'],
      where: { goods_spu_id: id },
      order: {
        add_time: 'desc',
      },
      skip: (page - 1) * pageSize || 0,
      take: pageSize || 15,
    });

    const res = {
      total: data[1],
      data: data[0],
    };

    return res;
  }
}
