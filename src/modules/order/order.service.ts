import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInformation } from './entities/order_information.entity';
import { OrderItem } from './entities/order_item.entity';
import { User } from '../user/entities/user.entity';
import { GoodsSpu } from '../goods/entities/goods_spu.entity';
import { GoodsSku } from '../goods/entities/goods_sku.entity';
import { Shop } from '../shop/entities/shop.entity';
import { Shopcart } from '../shopcart/entities/shopcart.entity';
import { CreateOrderByIdDto } from './dto/create-order-by-id.dto';
import { CreateOrderByShopcartDto } from './dto/create-order-by-shopcart.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { verify } from 'jsonwebtoken';
import { SECRCT } from '@/common/secrct';

enum StateType {
  WAITPAID = 'wait_paid',
  WAITSHIPPED = 'wait_shipped',
  WAITRECEIVE = 'wait_receive',
  WAITCOMMENT = 'wait_comment',
  FINISH = 'finish',
  CANCEL = 'cancel',
  INVALID = 'invalid',
}
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderInformation) private readonly orderInformationRepository: Repository<OrderInformation>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(GoodsSpu) private readonly goodsSpuRepository: Repository<GoodsSpu>,
    @InjectRepository(GoodsSku) private readonly goodsSkuRepository: Repository<GoodsSku>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Shopcart) private readonly shopcartRepository: Repository<Shopcart>
  ) {}

  async getOrderData(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { feature, pageSize, page } = req.query as any;

    if (!['all', 'wait_paid', 'wait_shipped', 'wait_receive', 'wait_comment'].includes(feature)) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }

    let fea: StateType | null = null;
    if (feature === 'wait_paid') fea = StateType.WAITPAID;
    else if (feature === 'wait_shipped') fea = StateType.WAITSHIPPED;
    else if (feature === 'wait_receive') fea = StateType.WAITRECEIVE;
    else if (feature === 'wait_comment') fea = StateType.WAITCOMMENT;

    const data = await this.orderInformationRepository.findAndCount({
      relations: ['order_item'],
      where: {
        user_id: _id,
        order_state: fea,
      },
      order: { update_time: 'DESC' },
      skip: (page - 1) * pageSize || 0,
      take: pageSize || 30,
    });

    return {
      total: data[1],
      data: data[0],
    };
  }

  async getConfirmOrderData(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;

    if (req.query.from === 'goods') {
      const data = await this.goodsSkuRepository.findOne({
        relations: ['goods_spu', 'shop'],
        where: { _id: req.query.goodsSkuId as string },
      });

      const dataByShop = data ? [{ shop: data.shop, goods: [{ ...data, goods_sku: data }] }] : [];

      return dataByShop;
    } else if (req.query.from === 'shopcart') {
      const data = await this.shopcartRepository.find({
        relations: ['shop', 'goods_spu', 'goods_sku'],
        where: { user_id: _id, selected: true },
        order: {
          add_time: 'desc',
        },
      });

      const dataByShop = data.reduce(
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

      return dataByShop;
    } else return [];
  }

  async createOrderById(req: Request, orderInfo: CreateOrderByIdDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { goodsSkuId, shopId, quantity } = orderInfo;

    if (!goodsSkuId) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    const user = await this.userRepository.findOne({ where: { _id } });
    if (!user) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);

    const shop = await this.shopRepository.findOne({ where: { _id: shopId } });
    if (!shop) throw new HttpException('商家不存在', HttpStatus.BAD_REQUEST);

    const sku = await this.goodsSkuRepository.findOne({ relations: ['goods_spu'], where: { _id: goodsSkuId } });
    if (!sku) throw new HttpException('商品不存在', HttpStatus.BAD_REQUEST);
    if (quantity > 100) throw new HttpException('超出此商品单次最大购买数量', HttpStatus.BAD_REQUEST);
    if (quantity > sku.goods_sku_stock) throw new HttpException('库存不足', HttpStatus.BAD_REQUEST);

    const repeatOrder = await this.orderItemRepository
      .createQueryBuilder('order_item')
      .innerJoinAndSelect('order_item.order_information', 'order_information')
      .where(`order_item.user_id = ${_id}`)
      .andWhere(`order_item.goods_sku_id = ${goodsSkuId}`)
      .andWhere(`order_information.order_state = 'wait_paid'`)
      .getMany();

    if (repeatOrder.length >= 2) {
      throw new HttpException(
        '未支付的订单中，已有两个订单中的商品是重复的，请先支付或取消订单',
        HttpStatus.BAD_REQUEST
      );
    }
    const spu = JSON.parse(JSON.stringify(sku.goods_spu));
    delete sku.goods_spu;

    sku.goods_sku_stock = sku.goods_sku_stock - quantity < 1 ? 0 : sku.goods_sku_stock - quantity;
    spu.goods_sku_total_stock = spu.goods_sku_total_stock - quantity < 1 ? 0 : spu.goods_sku_total_stock - quantity;

    user.order_total_wait_paid++;
    user.order_total_all++;
    await this.goodsSkuRepository.update(sku._id, sku);
    await this.goodsSpuRepository.update(spu._id, spu);
    await this.userRepository.update(user._id, user);

    const orderInformation = new OrderInformation();
    const orderItem = new OrderItem();

    orderInformation.user = user;
    orderInformation.order_state = StateType.WAITPAID;

    orderItem.order_information = orderInformation;
    orderItem.user = user;
    orderItem.goods_sku = sku;
    orderItem.goods_sku_img = sku.goods_sku_img;
    orderItem.goods_sku_price = sku.goods_sku_price;
    orderItem.sku_sales_attrs = sku.sku_sales_attrs;
    orderItem.goods_spu = spu;
    orderItem.goods_spu_name = spu.goods_spu_name;
    orderItem.shop = shop;
    orderItem.shop_name = shop.shop_name;
    orderItem.shop_logo = shop.shop_logo;
    orderItem.quantity = quantity;

    orderInformation.order_item = [orderItem];

    const newOrder = await this.orderInformationRepository.save(orderInformation);
    await this.orderItemRepository.save(orderItem);

    const timer = setTimeout(async () => {
      newOrder.order_state = StateType.CANCEL;
      newOrder.update_time = new Date();
      delete newOrder.order_item;
      await this.orderInformationRepository.update(newOrder._id, newOrder);

      const newSku = await this.goodsSkuRepository.findOne({ relations: ['goods_spu'], where: { _id: goodsSkuId } });
      newSku.goods_sku_stock += quantity;

      const newSpu = JSON.parse(JSON.stringify(newSku.goods_spu));
      delete newSku.goods_spu;
      newSpu.goods_sku_total_stock += quantity;

      await this.goodsSkuRepository.update(newSku._id, newSku);
      await this.goodsSpuRepository.update(newSpu._id, newSpu);

      const newUser = await this.userRepository.findOne({ where: { _id } });
      newUser.order_total_wait_paid = newUser.order_total_wait_paid < 1 ? 0 : newUser.order_total_wait_paid - 1;
      await this.userRepository.update(_id, newUser);

      clearTimeout(timer);
    }, 1000 * 60 * 60);

    return newOrder._id;
  }

  async createOrderByShopcart(req: Request, orderInfo: CreateOrderByShopcartDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { shopcartIds } = orderInfo;

    if (!shopcartIds) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);

    const user = await this.userRepository.findOne({ where: { _id } });
    if (!user) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);

    const data = await this.shopcartRepository
      .createQueryBuilder('shopcart')
      .leftJoinAndSelect('shopcart.shop', 'shop')
      .where(`shopcart._id IN (${shopcartIds})`)
      .andWhere(`shopcart.user_id = ${_id}`)
      .andWhere(`shopcart.selected = true`)
      .orderBy('shopcart.add_time', 'DESC')
      .getMany();

    if (shopcartIds.length !== data.length) {
      throw new HttpException('购物车数据不符，请刷新页面', HttpStatus.BAD_REQUEST);
    }

    const dataByShop = data.reduce(
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

    const readyData: Array<{ shop: Shop; goods: Array<any> }> = [];

    for (const item of dataByShop) {
      const shop = await this.shopRepository.findOne({ where: { _id: item.shop._id } });
      if (!shop) {
        throw new HttpException(`商家（${item.shop.shop_name}）不存在`, HttpStatus.BAD_REQUEST);
      }

      readyData.push({ shop, goods: [] });

      for (const goods of item.goods) {
        const sku = await this.goodsSkuRepository.findOne({
          relations: ['goods_spu'],
          where: { _id: goods.goods_sku_id },
        });

        if (!sku) throw new HttpException('商品不存在', HttpStatus.BAD_REQUEST);
        if (goods.quantity > 100) throw new HttpException('超出此商品单次最大购买数量', HttpStatus.BAD_REQUEST);
        if (goods.quantity > sku.goods_sku_stock) throw new HttpException('库存不足', HttpStatus.BAD_REQUEST);

        const repeatOrder = await this.orderItemRepository
          .createQueryBuilder('order_item')
          .innerJoinAndSelect('order_item.order_information', 'order_information')
          .where(`order_item.user_id = ${_id}`)
          .andWhere(`order_item.goods_sku_id = ${sku._id}`)
          .andWhere(`order_information.order_state = 'wait_paid'`)
          .getMany();

        if (repeatOrder.length >= 2) {
          throw new HttpException(
            '未支付的订单中，已有两个订单中的商品是重复的，请先支付或取消订单',
            HttpStatus.BAD_REQUEST
          );
        }

        readyData[readyData.length - 1].goods.push({ ...sku, buy_quantity: goods.quantity });
      }
    }

    const orderIds: Array<string> = [];

    for (const item of readyData) {
      const orderInformation = new OrderInformation();
      orderInformation.user = user;
      orderInformation.order_state = StateType.WAITPAID;

      const newOrder = await this.orderInformationRepository.save(orderInformation);
      orderIds.push(newOrder._id);

      for (const sku of item.goods) {
        const spu = JSON.parse(JSON.stringify(sku.goods_spu));
        delete sku.goods_spu;

        sku.goods_sku_stock = sku.goods_sku_stock - sku.buy_quantity < 1 ? 0 : sku.goods_sku_stock - sku.buy_quantity;
        spu.goods_sku_total_stock =
          spu.goods_sku_total_stock - sku.buy_quantity < 1 ? 0 : spu.goods_sku_total_stock - sku.buy_quantity;

        const { buy_quantity, ..._sku } = sku;
        await this.goodsSkuRepository.update(_sku._id, _sku);
        await this.goodsSpuRepository.update(spu._id, spu);

        const orderItem = new OrderItem();
        orderItem.order_information = orderInformation;
        orderItem.user = user;
        orderItem.goods_sku = _sku;
        orderItem.goods_sku_img = _sku.goods_sku_img;
        orderItem.goods_sku_price = _sku.goods_sku_price;
        orderItem.sku_sales_attrs = _sku.sku_sales_attrs;
        orderItem.goods_spu = spu;
        orderItem.goods_spu_name = spu.goods_spu_name;
        orderItem.shop = item.shop;
        orderItem.shop_name = item.shop.shop_name;
        orderItem.shop_logo = item.shop.shop_logo;
        orderItem.quantity = buy_quantity;

        await this.orderItemRepository.save(orderItem);
      }
    }

    for (const id of shopcartIds) this.shopcartRepository.delete(id);

    const newUser = await this.userRepository.findOne({ where: { _id } });

    newUser.order_total_wait_paid += readyData.length;
    newUser.order_total_all += readyData.length;
    newUser.shopcart_total_all =
      newUser.shopcart_total_all - readyData.length < 1 ? 0 : newUser.shopcart_total_all - readyData.length;

    await this.userRepository.update(newUser._id, newUser);

    const timer = setTimeout(async () => {
      const newOrders = await this.orderInformationRepository
        .createQueryBuilder('order_information')
        .innerJoinAndSelect('order_information.order_item', 'order_item')
        .where(`order_information_id IN (${orderIds})`)
        .getMany();

      for (const order of newOrders) {
        order.order_state = StateType.CANCEL;
        order.update_time = new Date();

        const orderItem = JSON.parse(JSON.stringify(order.order_item));
        delete order.order_item;
        await this.orderInformationRepository.update(order._id, order);

        for (const item of orderItem) {
          const sku = await this.goodsSkuRepository.findOne({ where: { _id: item.goods_sku_id } });
          const spu = await this.goodsSpuRepository.findOne({ where: { _id: item.goods_spu_id } });

          sku.goods_sku_stock += item.quantity;
          spu.goods_sku_total_stock += item.quantity;

          await this.goodsSkuRepository.update(sku._id, sku);
          await this.goodsSpuRepository.update(spu._id, spu);
        }
      }

      const newUser = await this.userRepository.findOne({ where: { _id } });
      newUser.order_total_wait_paid =
        newUser.order_total_wait_paid - newOrders.length < 1 ? 0 : newUser.order_total_wait_paid - newOrders.length;
      await this.userRepository.update(user._id, user);

      clearTimeout(timer);
    }, 1000 * 60 * 60);

    return orderIds;
  }

  async getPayInfo(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { orderIds } = req.query;

    if (!Array.isArray(orderIds)) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    if (!(orderIds as Array<any>).every((item: any) => typeof item === 'string')) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }

    const data = await this.orderInformationRepository
      .createQueryBuilder('order_information')
      .innerJoinAndSelect('order_information.order_item', 'order_item')
      .where(`order_information._id IN (${orderIds})`)
      .andWhere(`order_information.user_id = ${_id}`)
      .andWhere(`order_information.order_state = 'wait_paid'`)
      .getMany();

    if (data.length === 0) throw new HttpException('您已支付过了', HttpStatus.BAD_REQUEST);

    const totalPrice = data.reduce((sum: number, order: any) => {
      return (sum += order.order_item.reduce((subSum: number, item: any) => {
        return (subSum += Number(item.goods_sku_price) * item.quantity);
      }, 0));
    }, 0);

    return {
      totalPrice,
      qrcode: '',
    };
  }

  async getPayState(req: Request) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { orderIds } = req.query;

    if (!Array.isArray(orderIds)) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    if (!(orderIds as Array<any>).every((item: any) => typeof item === 'string')) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }

    const data = await this.orderInformationRepository
      .createQueryBuilder('order_information')
      .where(`order_information._id IN (${orderIds})`)
      .andWhere(`order_information.user_id = ${_id}`)
      .andWhere(`order_information.order_state = 'wait_paid'`)
      .getMany();

    const isComplete = !data.length;

    return isComplete;
  }

  async completePay(req: Request, body: UpdateOrderDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { orderIds } = body;

    if (!Array.isArray(orderIds)) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    if (!(orderIds as Array<any>).every((item: any) => typeof item === 'string')) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }

    const data = await this.orderInformationRepository
      .createQueryBuilder('order_information')
      .innerJoinAndSelect('order_information.order_item', 'order_item')
      .where(`order_information._id IN (${orderIds})`)
      .andWhere(`order_information.user_id = ${_id}`)
      .andWhere(`order_information.order_state = 'wait_paid'`)
      .getMany();

    if (data.length === 0) throw new HttpException('您已支付过了', HttpStatus.BAD_REQUEST);

    for (const order of data) {
      for (const orderItem of order.order_item) {
        const spu = await this.goodsSpuRepository.findOne({ where: { _id: orderItem.goods_spu_id } });
        const sku = await this.goodsSkuRepository.findOne({ where: { _id: orderItem.goods_sku_id } });
        spu.goods_sku_total_sales += orderItem.quantity;
        sku.goods_sku_sales += orderItem.quantity;
        await this.goodsSpuRepository.update(spu._id, spu);
        await this.goodsSkuRepository.update(sku._id, sku);
      }

      order.order_state = StateType.FINISH;
      order.update_time = new Date();
      delete order.order_item;
      await this.orderInformationRepository.update(order._id, order);
    }

    const user = await this.userRepository.findOne({ where: { _id } });
    user.order_total_wait_paid =
      user.order_total_wait_paid - data.length < 1 ? 0 : user.order_total_wait_paid - data.length;

    await this.userRepository.update(user._id, user);

    return '支付成功';
  }

  async cancelOrder(req: Request, body: UpdateOrderDto) {
    const { _id } = verify(req.headers.authorization, SECRCT) as any;
    const { orderIds } = body;

    if (!Array.isArray(orderIds)) throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    if (!(orderIds as Array<any>).every((item: any) => typeof item === 'string')) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }

    const data = await this.orderInformationRepository
      .createQueryBuilder('order_information')
      .innerJoinAndSelect('order_information.order_item', 'order_item')
      .where(`order_information._id IN (${orderIds})`)
      .andWhere(`order_information.user_id = ${_id}`)
      .andWhere(`order_information.order_state = 'wait_paid'`)
      .getMany();

    if (data.length === 0) throw new HttpException('该订单已支付过了，请刷新重试', HttpStatus.BAD_REQUEST);

    let cancelOrderSum = 0;

    for (const order of data) {
      const orderItem = JSON.parse(JSON.stringify(order.order_item));
      delete order.order_item;

      order.order_state = StateType.CANCEL;
      order.update_time = new Date();
      await this.orderInformationRepository.update(order._id, order);

      for (const item of orderItem) {
        const sku = await this.goodsSkuRepository.findOne({ where: { _id: item.goods_sku_id } });
        const spu = await this.goodsSpuRepository.findOne({ where: { _id: item.goods_spu_id } });

        sku.goods_sku_stock += item.quantity;
        spu.goods_sku_total_stock += item.quantity;

        await this.goodsSkuRepository.update(sku._id, sku);
        await this.goodsSpuRepository.update(spu._id, spu);
      }

      cancelOrderSum++;
    }

    console.log(cancelOrderSum);

    const user = await this.userRepository.findOne({ where: { _id } });
    user.order_total_wait_paid =
      user.order_total_wait_paid - cancelOrderSum < 1 ? 0 : user.order_total_wait_paid - cancelOrderSum;

    await this.userRepository.update(user._id, user);

    return '取消订单成功';
  }
}
