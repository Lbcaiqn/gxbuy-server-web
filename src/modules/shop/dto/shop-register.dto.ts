import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class ShopRegisterDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^.{8,50}$/, { message: '8到50个字符' })
  @ApiProperty({ type: String, example: '12345678' })
  shop_account: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,30}$/, {
    message: '8到30位，至少一个字母，至少一个数字',
  })
  @ApiProperty({ type: String, example: '12345678' })
  shop_password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^.{2,30}$/, { message: '2到30个字符' })
  @ApiProperty({ type: String, example: '某店铺' })
  shop_name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^.{8,50}$/, { message: '8到50个字符' })
  @ApiProperty({ type: String, example: '12345678' })
  shop_manager_account: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,30}$/, {
    message: '8到30位，至少一个字母，至少一个数字',
  })
  @ApiProperty({ type: String, example: '12345678' })
  shop_manager_password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^.{2,30}$/, { message: '2到30个字符' })
  @ApiProperty({ type: String, example: 'lgx' })
  shop_manager_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: 'AK47' })
  code: string;
}
