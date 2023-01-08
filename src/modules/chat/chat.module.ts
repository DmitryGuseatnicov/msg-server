import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entity/chat.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { Message } from './entity/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]), UserModule, AuthModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
