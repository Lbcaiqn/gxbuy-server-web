import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class CreateOrderByIdDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '12345' })
  goodsSkuId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '234' })
  shopId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, example: 1 })
  quantity: number;
}
