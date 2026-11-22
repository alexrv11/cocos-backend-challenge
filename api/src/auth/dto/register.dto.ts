import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@cocos.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
