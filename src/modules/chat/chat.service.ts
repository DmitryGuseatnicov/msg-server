import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateMessageDto } from './dto/create-massage.dto';
import { Chat } from './entity/chat.entity';
import { Message } from './entity/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private userService: UserService,
  ) {}

  async getUserChats(userId: ID) {
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
          messages: {
            chat: true,
            user: true,
          },
        },
        where: {
          id: In(userChats.map((chat) => chat.id)),
        },
      });

      return chats;
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async createChat(myId: ID, userId: ID): Promise<Chat> {
    try {
      const chats = await this.getUserChats(myId);

      const chat = chats.find((chat) =>
        chat.users.find((user) => user.id === userId),
      );

      if (chat) {
        return chat;
      }

      const newChat = new Chat();
      const users = await Promise.all([
        this.userService.getUserById(myId),
        this.userService.getUserById(userId),
      ]);
      newChat.users = users;

      return await this.chatRepository.save(newChat);
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async createMessage({ message, userId, chatId }: CreateMessageDto) {
    try {
      const user = await this.userService.getUserById(userId);
      const chat = await this.chatRepository.findOne({
        where: { id: chatId },
      });

      const newMessage = { ...new Message(), user, chat, message };

      return await this.messageRepository.save(newMessage);
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }

  async getMessagesByChatId(chatId: ID) {
    try {
      const messages = await this.messageRepository.find({
        where: { chat: { id: chatId } },
      });

      return messages;
    } catch (error) {
      throw new HttpException(error.message, error?.statusCode ?? 400);
    }
  }
}
