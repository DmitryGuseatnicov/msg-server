import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const [bearer, token] = client.handshake.headers.authorization.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException();
      }
      const user = this.jwtService.verify(token);
      client.handshake.auth = user;
      console.log('ea itrab');
      return true;
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
