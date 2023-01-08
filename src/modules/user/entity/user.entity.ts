import { Chat } from 'src/modules/chat/entity/chat.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  mail: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ default: false })
  isOnline: boolean;

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats: Chat[];
}
