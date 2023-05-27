import { IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class UpdateOrderDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: Array<string>, example: ['12345', '23456'] })
  orderIds: Array<string>;
}
