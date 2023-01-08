import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  chatId: ID;

  userId: ID;

  @IsNotEmpty()
  message: string;
}
