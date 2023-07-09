import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { ShopManager } from './entities/shop_manager.entity';
import { ShopManagerRole } from './entities/shop_manager_role.entity';
import { ShopRegisterDto } from './dto/shop-register.dto';
import { User } from '../user/entities/user.entity';
import { UserFollow } from '../user/entities/user_follow.entity';
import { sign, verify } from 'jsonwebtoken';
import { SECRCT } from '@/common/secrct';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(ShopManager) private readonly shopManagerRepository: Repository<ShopManager>,
    @InjectRepository(ShopManagerRole) private readonly shopManagerRoleRepository: Repository<ShopManagerRole>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserFollow) private readonly userFollowRepository: Repository<UserFollow>
  ) {}

  async getShopInfo(req: Request, id: string) {
    const data = await this.shopRepository.findOne({
      where: { _id: id },
    });

    if (!data) throw new HttpException('商家不存在', HttpStatus.BAD_REQUEST);

    const resData = { ...data, isFollow: false };

    //如果是目前是登录状态，就查看是否关注了商家
    let user_id: string | null = null;
    try {
      user_id = (verify(req.headers.authorization, SECRCT) as any)._id;
    } catch (err) {
      user_id = null;
    }

    if (user_id) {
      const user = await this.userRepository.findOne({ where: { _id: user_id } });
      if (user) {
        const userFollow = await this.userFollowRepository
          .createQueryBuilder('user_follow')
          .where('user_id = :uid', { uid: user_id })
          .andWhere('shop_id = :sid', { sid: resData._id })
          .getOne();

        if (userFollow) resData.isFollow = true;
      }
    }

    return resData;
  }

  async register(code: string, registerInfo: ShopRegisterDto) {
    if (code?.toLowerCase() !== registerInfo.code?.toLowerCase())
      throw new HttpException('验证码错误错误', HttpStatus.BAD_REQUEST);

    if (await this.shopRepository.findOne({ where: { shop_account: registerInfo.shop_account } })) {
      throw new HttpException('账号已存在', HttpStatus.BAD_REQUEST);
    }

    const shop = new Shop();
    const shopManager = new ShopManager();
    const shopManagerRole = new ShopManagerRole();

    shop.shop_logo = '';
    shop.shop_name = registerInfo.shop_name;
    shop.shop_account = registerInfo.shop_account;
    shop.shop_password = await bcrypt.hash(registerInfo.shop_password, 10);
    shop.shop_manager = [];
    shop.shop_manager_role = [];

    let newShop: Shop | null = null;
    try {
      newShop = await this.shopRepository.save(shop);
    } catch (err) {
      throw new HttpException('店铺名已存在', HttpStatus.BAD_REQUEST);
    }

    shopManager.shop_manager_name = registerInfo.shop_manager_name;
    shopManager.shop_manager_account = registerInfo.shop_manager_account;
    shopManager.shop_manager_password = await bcrypt.hash(registerInfo.shop_manager_password, 10);
    shopManager.shop = shop;
    await this.shopManagerRepository.save(shopManager);

    shopManagerRole.shop_manager_role_name = 'admin';
    shopManagerRole.shop = shop;
    await this.shopManagerRoleRepository.save(shopManagerRole);

    const jwt = sign(
      {
        _id: newShop._id,
      },
      SECRCT
    );

    delete newShop.shop_password;

    return {
      message: '注册成功',
      jwt,
      newShop,
    };
  }
}
