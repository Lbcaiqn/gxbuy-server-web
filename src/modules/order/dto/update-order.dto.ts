import { IsNotEmpty, ArrayNotContains, IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class UpdateOrderDto {
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: Array<string>, example: ['12345', '23456'] })
  orderIds: Array<string>;
}
