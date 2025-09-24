import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private roomsService: RoomsService,
  ) {}

  async create(createMessageDto: CreateMessageDto, senderId: string): Promise<Message> {
    // Check if user is member of the room
    const isMember = await this.roomsService.isUserMember(createMessageDto.roomId, senderId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId,
    });

    console.log('eee');

    return this.messagesRepository.save(message);
  }

  async findMessageWithSender(messageId: string): Promise<Message> {
    return this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });
  }

  async findRoomMessages(roomId: string, userId: string): Promise<Message[]> {
    // Check if user is member of the room
    const isMember = await this.roomsService.isUserMember(roomId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return this.messagesRepository.find({
      where: { roomId, isDeleted: false },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, content: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = content;
    message.isEdited = true;
    
    return this.messagesRepository.save(message);
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.content = 'This message has been deleted';
    await this.messagesRepository.save(message);
  }
}