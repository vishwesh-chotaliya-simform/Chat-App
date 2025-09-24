import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms/:roomId/messages')
  getRoomMessages(
    @Param('roomId') roomId: string,
    @Request() req,
  ) {
    return this.chatService.findRoomMessages(roomId, req.user.userId);
  }

  @Post('messages')
  createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.create(createMessageDto, req.user.userId);
  }

  @Patch('messages/:id')
  updateMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.chatService.update(id, content, req.user.userId);
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string, @Request() req) {
    return this.chatService.remove(id, req.user.userId);
  }
}