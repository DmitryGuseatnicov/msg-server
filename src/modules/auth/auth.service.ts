import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login({ mail, password }: LoginUserDto): Promise<{ token: Token }> {
    try {
      const user = await this.userService.compareUser(mail, password);
      const token = this.jwtService.sign(user);
      return { token };
    } catch (error) {
      console.error(error);
    }
  }

  async register(dto: CreateUserDto): Promise<{ token: Token }> {
    try {
      const user = await this.userService.createUser(dto);
      const token = this.jwtService.sign(user);
      return { token };
    } catch (error) {
      console.error(error);
    }
  }

  async auth(id: UserId): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userService.getUserById(id);
      return user;
    } catch (error) {
      console.error(error);
    }
  }

  async compare(
    mail: Mail,
    password: Password,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userService.compareUser(mail, password);
      return user;
    } catch (error) {
      console.error(error);
    }
  }
}
