import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '12345678' })
  user_account: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '123456' })
  user_password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: 'AK47' })
  code: string;
}
