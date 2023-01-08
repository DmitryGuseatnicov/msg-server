import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest();
        const [bearer, token] = request.headers.authorization.split(' ');

        if (bearer !== 'Bearer' || !token) {
          throw new UnauthorizedException();
        }

        const user = this.jwtService.verify(token);
        request.user = user;

        return true;
      }

      if (context.getType() === 'ws') {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const [bearer, token] =
          client.handshake.headers.authorization.split(' ');

        if (bearer !== 'Bearer' || !token) {
          throw new UnauthorizedException();
        }

        const user = this.jwtService.verify(token);
        client.handshake.auth = user;

        return true;
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
