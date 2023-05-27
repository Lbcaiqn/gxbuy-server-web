import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

enum CommandType {
  QUANTITY = 'quantity',
  SELECTED = 'selected',
}

export class ShopcartUpdateSingleStateDto {
  @IsNotEmpty()
  @IsEnum(CommandType)
  @ApiProperty({ type: String, example: 'quantity' })
  command: CommandType;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, example: 1 })
  quantity?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '12345' })
  goods_sku_id: string;
}
