import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  messageType?: string;
}
