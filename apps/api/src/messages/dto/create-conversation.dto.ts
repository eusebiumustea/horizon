import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  participantIds: string[];
}

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  messageType?: string;
}
