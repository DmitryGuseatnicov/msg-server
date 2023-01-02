import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  mail: string;

  @IsNotEmpty()
  password: string;
}
