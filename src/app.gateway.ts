import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './modules/chat/chat.service';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { UserService } from './modules/user/user.service';

@WebSocketGateway(4040, {
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: string): Promise<void> {
    const { id: userId } = client.handshake.auth;
    const { chatId, message } = JSON.parse(payload);

    const newMessage = await this.chatService.createMessage({
      message,
      userId,
      chatId,
    });

    this.server.to(chatId).emit('msgToClient', newMessage);
  }

  afterInit(server: Server) {
    this.logger.log('Init', server);
  }

  async handleDisconnect(client: Socket) {
    const user = this.verifyUser(client);
    this.userService.updateUser(user.id, { isOnline: false });

    const chats = await this.chatService.getUserChats(user.id);

    if (chats) {
      const chatsRooms = chats.map((chat) => chat.id);
      this.server.to(chatsRooms).emit('userDisconnected', user);
    }

    this.logger.log(`Client disconnected: ${user}`);
  }

  async handleConnection(client: Socket) {
    const user = this.verifyUser(client);

    if (user) {
      this.userService.updateUser(user.id, { isOnline: true });
    }

    const chats = await this.chatService.getUserChats(user.id);

    if (chats) {
      const chatsRooms = chats.map((chat) => chat.id);
      client.join(chatsRooms);

      this.server.to(chatsRooms).emit('userConnected', user);
    }

    this.logger.log(`Client connected: ${user}`);
  }

  private verifyUser(client: Socket) {
    const [bearer, token] = client.handshake.headers.authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    const user = this.jwtService.verify(token);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
