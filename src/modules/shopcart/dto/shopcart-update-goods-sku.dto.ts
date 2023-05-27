import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class ShopcartUpdateGoodsSkuDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '12345' })
  goods_sku_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '23456' })
  new_goods_sku_id: string;
}
