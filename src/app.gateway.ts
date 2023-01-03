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
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { WsJwtGuard } from './modules/auth/guard/jwt-auth-soket.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway(4040)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(private jwtService: JwtService) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    console.log(client.handshake.auth);
    this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init', server);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    const [bearer, token] = client.handshake.headers.authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }
    const user = this.jwtService.verify(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    console.log({ user });
    this.logger.log(`Client connected: ${client.id}`);
  }
}
