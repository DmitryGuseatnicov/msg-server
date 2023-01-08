import { User } from 'src/modules/user/entity/user.entity';
import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  users: Omit<User, 'password'>[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
