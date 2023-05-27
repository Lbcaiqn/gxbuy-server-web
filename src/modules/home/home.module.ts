import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeBanner } from './entities/home_banner.entity';
import { HomeRecommend } from './entities/home_recommend.entity';
import { HomeFloor } from './entities/home_floor.entity';
@Module({
  imports: [TypeOrmModule.forFeature([HomeBanner, HomeRecommend, HomeFloor])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
