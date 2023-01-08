import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../user/entity/user.entity';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createChat(@Req() { user }: { user: User }, @Body('userId') userId: ID) {
    return this.chatService.createChat(user.id, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getChats(@Req() { user }: { user: User }) {
    return this.chatService.getUserChats(user.id);
  }
}
