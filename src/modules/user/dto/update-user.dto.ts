import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '../entity/user.entity';

export class UpdateUserDto implements Partial<User> {
  @IsEmail()
  mail?: string;

  firstName?: string;

  lastName?: string;

  isOnline?: boolean;

  @IsNotEmpty()
  password?: string;
}
