import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Shopcart } from './entities/shopcart.entity';
import { User } from '../user/entities/user.entity';
import { GoodsSpu } from '../goods/entities/goods_spu.entity';
import { GoodsSku } from '../goods/entities/goods_sku.entity';
import { Shop } from '../shop/entities/shop.entity';
import { ShopcartInsertDto } from './dto/shopcart-insert.dto';
import { ShopcartUpdateAllSelectedDto } from './dto/shopcart-update-all-selected.dto';
import { ShopcartUpdateSingleStateDto } from './dto/shopcart-update-single-state.dto';
import { ShopcartUpdateGoodsSkuDto } from './dto/shopcart-update-goods-sku.dto';
import { verify } from 'jsonwebtoken';
import { SECRCT } from '@/common/secrct';
import { groupBy } from 'lodash';
console.log(groupBy);

@Injectable()
export class ShopcartService {
  constructor(
    @InjectRepository(Shopcart) private readonly shopcartRepository: Repository<Shopcart>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(GoodsSpu) private readonly goodsSpuRepository: Repository<GoodsSpu>,
    @InjectRepository(GoodsSku) private readonly goodsSkuRepository: Repository<GoodsSku>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>
  ) {}

  private readonly maxQuantity: number = 1000000000;

  async insertShopcartData(req: Request, insertInfo: ShopcartInsertDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const user = await this.userRepository.findOne({
      where: { _id },
    });

    const goodsSpu = await this.goodsSpuRepository.findOne({
      where: { _id: insertInfo.goods_spu_id },
    });

    const goodsSku = await this.goodsSkuRepository.findOne({
      where: { _id: insertInfo.goods_sku_id },
    });

    const shop = await this.shopRepository.findOne({
      where: { _id: insertInfo.shop_id },
    });

    if (!user || !goodsSpu || !goodsSku || !shop) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    const isHave = await this.shopcartRepository
      .createQueryBuilder('showcart')
      .where('user_id = :userid AND goods_sku_id = :skuid', {
        userid: _id,
        skuid: insertInfo.goods_sku_id,
      })
      .getOne();

    if (isHave) {
      isHave.quantity =
        isHave.quantity + insertInfo.quantity > this.maxQuantity
          ? this.maxQuantity
          : isHave.quantity + insertInfo.quantity;
      await this.shopcartRepository.update(isHave._id, isHave);
      return `购物车已有记录，数量 + ${insertInfo.quantity}`;
    }

    const shopcart = new Shopcart();
    shopcart.selected = false;
    shopcart.quantity = insertInfo.quantity >= this.maxQuantity ? this.maxQuantity : insertInfo.quantity;
    shopcart.user = user;
    shopcart.goods_spu = goodsSpu;
    shopcart.goods_sku = goodsSku;
    shopcart.shop = shop;
    await this.shopcartRepository.save(shopcart);

    user.shopcart_total_all++;
    await this.userRepository.save(user);

    return '插入成功';
  }

  async getShopcartData(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.shopcartRepository.findAndCount({
      relations: ['shop', 'goods_spu', 'goods_sku'],
      where: { user_id: _id },
      order: {
        add_time: 'desc',
      },
    });

    const dataByShop = data[0].reduce(
      (acc: any, item: any) => {
        const shopId = item.shop._id;

        if (!acc.ids[shopId] && acc.ids[shopId] !== 0) {
          acc.ids[shopId] = acc.data.length;
          acc.data.push({
            shop: item.shop,
            goods: [item],
          });
        } else {
          acc.data[acc.ids[shopId]].goods.push(item);
        }
        return acc;
      },
      { ids: {}, data: [] }
    ).data;

    const res = {
      total: data[1],
      totalByShop: dataByShop.length,
      data: dataByShop,
    };

    return res;
  }

  async updateGoodsSku(req: Request, updateInfo: ShopcartUpdateGoodsSkuDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.shopcartRepository
      .createQueryBuilder('shopcart')
      .where('user_id = :id', { id: _id })
      .andWhere('goods_sku_id = :goodsSkuId', { goodsSkuId: updateInfo.goods_sku_id })
      .getOne();

    if (!data) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    const newSku = await this.goodsSkuRepository
      .createQueryBuilder('goods_sku')
      .where('_id = :newGoodsSkuId', { newGoodsSkuId: updateInfo.new_goods_sku_id })
      .getOne();

    if (!newSku || newSku.goods_spu._id != data.goods_spu._id) return '参数错误';

    data.goods_sku = newSku;
    await this.shopcartRepository.update(data._id, data);

    return '修改成功';
  }

  async updateAllSelected(req: Request, updateInfo: ShopcartUpdateAllSelectedDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const queryBuilder = this.shopcartRepository.createQueryBuilder('shopcart').where('user_id = :id ', { id: _id });

    const data: Shopcart[] = /shop/.test(updateInfo.command)
      ? await queryBuilder.andWhere('shop_id = :shopId', { shopId: updateInfo.shop_id }).getMany()
      : await queryBuilder.getMany();

    if (data.length === 0) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    for (const i of data) {
      i.selected = updateInfo.selectedOrCancel;
      await this.shopcartRepository.update(i._id, i);
    }

    return '修改成功';
  }

  async updateSingleState(req: Request, updateInfo: ShopcartUpdateSingleStateDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.shopcartRepository
      .createQueryBuilder('shopcart')
      .where('user_id = :id ', { id: _id })
      .andWhere('goods_sku_id = :goodsSkuId ', { goodsSkuId: updateInfo.goods_sku_id })
      .getOne();

    if (!data) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    switch (updateInfo.command) {
      case 'quantity':
        let quantity = updateInfo.quantity || 1;
        quantity = quantity < 1 ? 1 : quantity;
        quantity = quantity > this.maxQuantity ? this.maxQuantity : quantity;
        data.quantity = quantity;
        break;
      case 'selected':
        data.selected = !data.selected;
        break;
      default:
        break;
    }

    await this.shopcartRepository.update(data._id, data);

    return '修改成功';
  }

  async deleteSingle(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { goods_sku_id } = req.params as any;

    const data = await this.shopcartRepository
      .createQueryBuilder('shopcart')
      .where('user_id = :uid AND goods_sku_id = :kid', { uid: _id, kid: goods_sku_id })
      .getOne();

    if (!data) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    await this.shopcartRepository.delete(data._id);

    const user = await this.userRepository.findOne({ where: { _id } });
    user.shopcart_total_all = user.shopcart_total_all < 1 ? 0 : user.shopcart_total_all - 1;
    await this.userRepository.save(user);

    return '删除成功';
  }

  async deleteAll(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    const data = await this.shopcartRepository
      .createQueryBuilder('shopcart')
      .where('user_id = :id', { id: _id })
      .getMany();

    if (data.length === 0) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    for (let i of data) this.shopcartRepository.delete(i._id);

    const user = await this.userRepository.findOne({ where: { _id } });
    user.shopcart_total_all = 0;
    await this.userRepository.save(user);

    return '清空成功';
  }
}
