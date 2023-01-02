import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords, hastPassword } from 'src/libs/bcript';
import { DeleteResult, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
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
      console.error(error);
    }
  }
  async deleteUser(id: UserId): Promise<DeleteResult> {
    try {
      const user = await this.userRepository.delete({ id });

      return user;
    } catch (error) {
      console.error(error);
    }
  }

  async updateUser(
    id: UserId,
    dto: Partial<CreateUserDto>,
  ): Promise<Omit<User, 'password'>> {
    try {
      let user = await this.userRepository.findOne({ where: { id } });

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
      console.error(error);
    }
  }

  async getUserById(id: UserId): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException();
      }

      return this.removePassword(user);
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
    }
  }

  async compareUser(
    mail: Mail,
    password: Password,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOne({ where: { mail } });
      const isMatchPasswords = comparePasswords(password, user.password);

      if (isMatchPasswords) {
        return this.removePassword(user);
      }
      return null;
    } catch (error) {
      console.error(error);
    }
  }

  private removePassword(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
