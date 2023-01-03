import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Chat } from './entity/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private userService: UserService,
  ) {}

  async createChat(currentUserId: UserId, userId: UserId): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOne({
        select: {
          users: { id: true, firstName: true, lastName: true },
        },
        relations: {
          users: true,
        },
        where: {
          users: [{ id: currentUserId }, { id: userId }],
        },
      });

      if (chat) {
        return chat;
      }

      const newChat = new Chat();
      const users = await Promise.all([
        this.userService.getUserById(currentUserId),
        this.userService.getUserById(userId),
      ]);
      newChat.users = users;

      return await this.chatRepository.save(newChat);
    } catch (error) {
      console.log(error);
    }
  }

  async getUserChats(userId: UserId) {
    try {
      const userChats = await this.chatRepository.find({
        where: {
          users: { id: userId },
        },
      });

      const chats = await this.chatRepository.find({
        select: {
          users: { id: true, firstName: true, lastName: true, mail: true },
        },
        relations: {
          users: true,
        },
        where: {
          id: In(userChats.map((chat) => chat.id)),
        },
      });

      return chats;
    } catch (error) {
      console.log(error);
    }
  }
}
