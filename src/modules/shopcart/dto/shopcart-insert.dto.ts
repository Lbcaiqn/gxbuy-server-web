import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class ShopcartInsertDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, example: 1 })
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '12345' })
  goods_spu_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '12345' })
  goods_sku_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '234' })
  shop_id: string;
}
