import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Req() { user }: { user: User },
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.userService.updateUser(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  getUserById(@Param() id: number) {
    return this.userService.getUserById(id);
  }

  @Get('search/query')
  @UseGuards(JwtAuthGuard)
  getUserByQuery(@Query() { q }: { q: string }) {
    return this.userService.getUserByQuery(q);
  }
}
