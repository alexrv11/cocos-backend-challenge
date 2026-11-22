import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@cocos.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepass123' })
  @IsString()
  password: string;
}
