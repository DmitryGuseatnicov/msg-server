import { IsEmail, IsNotEmpty } from 'class-validator';

import { User } from '../entity/user.entity';

export class CreateUserDto implements Omit<User, 'id' | 'chats' | 'isOnline'> {
  @IsEmail()
  mail: string;

  firstName: string;

  lastName: string;

  @IsNotEmpty()
  password: string;
}
