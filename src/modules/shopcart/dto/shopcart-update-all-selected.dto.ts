import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

enum CommandType {
  ALL = 'all',
  SHOP = 'shop',
}

export class ShopcartUpdateAllSelectedDto {
  @IsNotEmpty()
  @IsEnum(CommandType)
  @ApiProperty({ type: String, example: 'all' })
  command: CommandType;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: Boolean, example: true })
  selectedOrCancel: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, example: '' })
  shop_id?: string;
}
