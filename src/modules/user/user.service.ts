import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords, hastPassword } from 'src/libs/bcript';
import { DeleteResult, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      dto.password = await hastPassword(dto.password);
      const user = await this.userRepository.save(dto);

      if (!user) {
        throw new BadRequestException();
      }

      return this.removePassword(user);
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async deleteUser(userId: ID): Promise<DeleteResult> {
    try {
      const user = await this.userRepository.delete({ id: userId });

      return user;
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async updateUser(
    userId: ID,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      let user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException();
      }
      if (dto.password) {
        dto.password = await hastPassword(dto.password);
      }
      user = { ...user, ...dto };

      const userUpdated = await this.userRepository.save(user);

      return this.removePassword(userUpdated);
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async getUserById(userId: ID): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException();
      }

      return this.removePassword(user);
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async getUserByQuery(query: string): Promise<Omit<User, 'password'>[]> {
    try {
      const user = await this.userRepository.find({
        where: [
          { mail: Like(`%${query}%`) },
          { firstName: Like(`%${query}%`) },
          { lastName: Like(`%${query}%`) },
        ],
      });
      return user.map((user) => this.removePassword(user));
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async getAllUsers(): Promise<{
    users: Omit<User, 'password'>[];
    count: number;
  }> {
    try {
      const [users, count] = await this.userRepository.findAndCount();

      return {
        users: users.map((user) => this.removePassword(user)),
        count,
      };
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async compareUser(
    mail: Mail,
    password: Password,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOne({ where: { mail } });
      const isMatchPasswords = await comparePasswords(password, user.password);
      console.log({ isMatchPasswords });

      if (isMatchPasswords) {
        return this.removePassword(user);
      }

      throw new UnauthorizedException();
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  private removePassword(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
