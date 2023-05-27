import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserFavorite } from './entities/user_favorite.entity';
import { UserFollow } from './entities/user_follow.entity';
import { UserBrowseHistory } from './entities/user_browse_history.entity';
import { UserSearchHistory } from './entities/user_search_history.entity';
import { GoodsSpu } from '../goods/entities/goods_spu.entity';
import { Shop } from '../shop/entities/shop.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { OrderItem } from '../order/entities/order_item.entity';
import { sign, verify } from 'jsonwebtoken';
import { SECRCT } from '@/common/secrct';
import * as svgCaptcha from 'svg-captcha';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserFavorite) private readonly userFavoriteRepository: Repository<UserFavorite>,
    @InjectRepository(UserFollow) private readonly userFollowRepository: Repository<UserFollow>,
    @InjectRepository(UserBrowseHistory) private readonly userBrowseHistoryRepository: Repository<UserBrowseHistory>,
    @InjectRepository(UserSearchHistory) private readonly userSearchHistoryRepository: Repository<UserSearchHistory>,
    @InjectRepository(GoodsSpu) private readonly goodsSpuRepository: Repository<GoodsSpu>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>
  ) {}

  async register(code: string, registerInfo: UserRegisterDto) {
    if (code !== registerInfo.code) throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);

    if (await this.userRepository.findOne({ where: { user_account: registerInfo.user_account } })) {
      throw new HttpException('账号已存在', HttpStatus.BAD_REQUEST);
    }

    const user = new User();

    user.user_name = registerInfo.user_name;
    user.user_icon = '';
    user.user_account = registerInfo.user_account;
    user.user_password = await bcrypt.hash(registerInfo.user_password, 10);

    let newUser: User | null = null;
    try {
      newUser = await this.userRepository.save(user);
    } catch (err) {
      throw new HttpException('昵称已存在', HttpStatus.BAD_REQUEST);
    }

    const jwt = sign(
      {
        _id: newUser._id,
      },
      SECRCT,
      { expiresIn: 60 * 60 * 24 }
    );

    delete newUser.user_password;

    return {
      message: '注册成功',
      jwt,
      newUser,
    };
  }

  async login(code: string, loginInfo: UserLoginDto) {
    if (code !== loginInfo.code) throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.user_password')
      .where('user_account = :ua', { ua: loginInfo.user_account })
      .getOne();

    if (!user) throw new HttpException('账号不存在', HttpStatus.BAD_REQUEST);

    const valid = await bcrypt.compare(loginInfo.user_password, user.user_password);
    if (!valid) throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);

    const jwt = sign(
      {
        _id: user._id,
      },
      SECRCT,
      { expiresIn: 60 * 60 * 24 }
    );

    delete user.user_password;

    return {
      message: '登录成功',
      jwt,
      user,
    };
  }

  async createCode(req: any, res: Response) {
    const code = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 34,
      background: '#cc9966',
    });

    req.session.code = code.text;

    console.log(code.text);

    res.type('image/svg+xml');

    res.send(code.data);
  }

  async getUserInfo(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const user = await this.userRepository.findOne({
      where: { _id },
    });

    if (!user) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);

    return user;
  }

  async getUserRecord(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { feature, pageSize, page } = req.query as any;

    if (!['favorite', 'follow', 'buyed_shop', 'browse_history', 'search_history'].includes(feature)) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }

    let data: any = null;

    switch (feature) {
      case 'favorite':
        data = await this.userFavoriteRepository
          .createQueryBuilder('user_favorite')
          .innerJoinAndSelect('user_favorite.goods_spu', 'goods_spu')
          .innerJoinAndSelect('goods_spu.shop', 'shop')
          .where('user_id = :id', { id: _id })
          .orderBy('user_favorite.add_time', 'DESC')
          .offset((page - 1) * pageSize || 0)
          .limit(pageSize || 30)
          .getManyAndCount();
        break;

      case 'follow':
        data = await this.userFollowRepository
          .createQueryBuilder(`user_follow`)
          .innerJoinAndSelect(`user_follow.shop`, 'shop')
          .where('user_follow.user_id = :id', { id: _id })
          .orderBy('user_follow.add_time', 'DESC')
          .offset((page - 1) * pageSize || 0)
          .limit(pageSize || 30)
          .getManyAndCount();

        for (const i of data[0]) {
          const goods_spu = await this.goodsSpuRepository
            .createQueryBuilder('goods_spu')
            .where('goods_spu.shop_id = :id', { id: i.shop._id })
            .orderBy('goods_sku_total_sales', 'DESC')
            .offset(0)
            .limit(5)
            .getMany();

          i.shop.isFollow = true;
          i.shop.goods_spu = goods_spu;
        }

        break;

      case 'buyed_shop':
        data = await this.orderItemRepository
          .createQueryBuilder(`order_item`)
          .innerJoinAndSelect(`order_item.shop`, 'shop')
          .where('order_item.user_id = :id', { id: _id })
          .orderBy('order_item.add_time', 'DESC')
          .offset((page - 1) * pageSize || 0)
          .limit(pageSize || 30)
          .getManyAndCount();

        const uniqueData = data[0].reduce((unique: any, item: any) => {
          if (!unique.find((i: any) => i.shop_id === item.shop_id)) unique.push(item);
          return unique;
        }, []);

        data = [uniqueData, uniqueData.length];

        for (const i of data[0]) {
          const goods_spu = await this.goodsSpuRepository
            .createQueryBuilder('goods_spu')
            .where('goods_spu.shop_id = :id', { id: i.shop._id })
            .orderBy('goods_sku_total_sales', 'DESC')
            .offset(0)
            .limit(5)
            .getMany();

          const isFollow = await this.userFollowRepository.findOne({ where: { user_id: _id, shop_id: i.shop._id } });
          i.shop.goods_spu = goods_spu;
          i.shop.isFollow = !!isFollow;
        }

        break;

      case 'browse_history':
        const columns =
          this.userBrowseHistoryRepository.metadata.columns
            .map(column => column.propertyName)
            .reduce((str, c) => {
              str += `'ubh_${c}', ubh.${c},`;
              return str;
            }, '') +
          this.goodsSpuRepository.metadata.columns
            .map(column => column.propertyName)
            .reduce((str, c) => {
              str += `'${c}', goods_spu.${c},`;
              return str;
            }, '');

        data = await this.userBrowseHistoryRepository
          .createQueryBuilder('ubh')
          .select(`DATE_FORMAT(ubh.add_time, '%Y年%m月')`, 'time')
          .addSelect(
            `JSON_ARRAYAGG(
                   JSON_OBJECT(
                     ${columns}
                     'shop', JSON_OBJECT('shop_name', shop.shop_name,'shop_logo',shop.shop_logo))
                )`,
            'goods'
          )
          .innerJoin('ubh.goods_spu', 'goods_spu')
          .innerJoin('goods_spu.shop', 'shop')
          .where('ubh.user_id = :id', { id: _id })
          .groupBy('time')
          .orderBy('time', 'DESC')
          .offset((page - 1) * pageSize || 0)
          .limit(pageSize || 30)
          .getRawMany();

        if (data.length === 0) {
          data = [[], 0];
          break;
        }

        const subData = await this.userBrowseHistoryRepository
          .createQueryBuilder('ubh')
          .where('ubh.user_id = :id', { id: _id })
          .orderBy('add_time', 'DESC')
          .offset((page - 1) * pageSize || 0)
          .limit(pageSize || 30)
          .getManyAndCount();

        data = await this.userBrowseHistoryRepository
          .createQueryBuilder('ubh')
          .select(`DATE_FORMAT(ubh.add_time, '%Y年%m月')`, 'time')
          .addSelect(
            `JSON_ARRAYAGG(
               JSON_OBJECT(
                 ${columns}
                 'shop', JSON_OBJECT('shop_name', shop.shop_name,'shop_logo',shop.shop_logo))
            )`,
            'goods'
          )
          .innerJoin('ubh.goods_spu', 'goods_spu')
          .innerJoin('goods_spu.shop', 'shop')
          .where(`ubh._id IN (${subData[0].map(s => s._id)})`)
          .groupBy('time')
          .orderBy('time', 'DESC')
          .getRawMany();

        data = [data, subData[1]];
        break;

      case 'search_history':
        data = await this.userSearchHistoryRepository
          .createQueryBuilder('user_search_history')
          .where('user_id = :id', { id: _id })
          .orderBy('user_search_history.add_time', 'DESC')
          .offset((page - 1) * pageSize || 0)
          .limit(pageSize || 30)
          .getManyAndCount();
        break;

      default:
        break;
    }

    return {
      total: data[1],
      data: data[0],
    };
  }

  async favorite(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { goods_spu_id } = req.body;

    const data = await this.userFavoriteRepository
      .createQueryBuilder('user_favorite')
      .where('user_id = :uid', { uid: _id })
      .andWhere('goods_spu_id = :gid', { gid: goods_spu_id })
      .getOne();

    if (!data) {
      const user = await this.userRepository.findOne({ where: { _id } });
      const spu = await this.goodsSpuRepository.findOne({ where: { _id: goods_spu_id } });

      if (!user && !spu) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

      const userFavorite = new UserFavorite();
      userFavorite.user = user;
      userFavorite.goods_spu = spu;
      await this.userFavoriteRepository.save(userFavorite);
      spu.goods_spu_total_favorite++;
      await this.goodsSpuRepository.save(spu);
    } else {
      const spu = await this.goodsSpuRepository.findOne({ where: { _id: goods_spu_id } });
      await this.userFavoriteRepository.delete(data._id);
      spu.goods_spu_total_favorite <= 0 ? 0 : spu.goods_spu_total_favorite--;
      await this.goodsSpuRepository.save(spu);
    }

    return '操作成功';
  }

  async follow(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { shop_id } = req.body;

    const data = await this.userFollowRepository
      .createQueryBuilder('user_follow')
      .where('user_id = :uid', { uid: _id })
      .andWhere('shop_id = :sid', { sid: shop_id })
      .getOne();

    if (!data) {
      const user = await this.userRepository.findOne({ where: { _id: _id } });
      const shop = await this.shopRepository.findOne({ where: { _id: shop_id } });

      if (!user && !shop) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

      const userFollow = new UserFollow();
      userFollow.user = user;
      userFollow.shop = shop;
      await this.userFollowRepository.save(userFollow);
    } else await this.userFollowRepository.delete(data._id);

    return '操作成功';
  }

  async deleteSearchHistorySingle(req: Request, hid: string) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.userSearchHistoryRepository.findOne({ where: { _id: hid, user_id: _id } });

    if (data) await this.userSearchHistoryRepository.delete(data._id);

    return '删除成功';
  }

  async deleteSearchHistoryAll(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.userSearchHistoryRepository.find({
      where: { user_id: _id },
    });

    if (data) {
      for (let i of data) await this.userSearchHistoryRepository.delete(i._id);
    }

    return '删除成功';
  }

  async deleteBrowseHistorySingle(req: Request, goodsSpuId: string) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.userBrowseHistoryRepository.findOne({ where: { goods_spu_id: goodsSpuId, user_id: _id } });

    if (data) await this.userBrowseHistoryRepository.delete(data._id);

    return '删除成功';
  }

  async deleteBrowseHistoryAll(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.userBrowseHistoryRepository.find({
      where: { user_id: _id },
    });

    if (data) {
      for (let i of data) await this.userBrowseHistoryRepository.delete(i._id);
    }

    return '删除成功';
  }
}
