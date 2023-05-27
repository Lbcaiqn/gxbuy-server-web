import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeBanner } from './entities/home_banner.entity';
import { HomeRecommend } from './entities/home_recommend.entity';
import { HomeFloor } from './entities/home_floor.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomeBanner) private readonly homeBannerRepository: Repository<HomeBanner>,
    @InjectRepository(HomeRecommend) private readonly homeRecommendRepository: Repository<HomeRecommend>,
    @InjectRepository(HomeFloor) private readonly homeFloorRepository: Repository<HomeFloor>
  ) {}

  async getBannerData(type: string) {
    const data = await this.homeBannerRepository
      .createQueryBuilder('home_banner')
      .where('type = :type', { type })
      .getMany();
    return data;
  }

  async getRecommendData() {
    const data = await this.homeRecommendRepository
      .createQueryBuilder('home_recommend')
      .innerJoinAndSelect('home_recommend.children', 'children')
      .where('home_recommend.pid IS NULL')
      .getMany();

    return data;
  }

  async getFloorData() {
    const data = await this.homeFloorRepository
      .createQueryBuilder('home_floor')
      .innerJoinAndSelect('home_floor.children', 'children')
      .where('home_floor.pid IS NULL')
      .getMany();

    return data;
  }
}
