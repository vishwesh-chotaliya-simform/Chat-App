import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomType } from './entities/room.entity';
import { RoomMember, MemberRole } from './entities/room-member.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private roomMembersRepository: Repository<RoomMember>,
  ) {}

  async create(createRoomDto: CreateRoomDto, creatorId: string): Promise<Room> {
    const room = this.roomsRepository.create({
      ...createRoomDto,
      createdBy: creatorId,
    });

    const savedRoom = await this.roomsRepository.save(room);

    // Add creator as admin
    await this.roomMembersRepository.save({
      userId: creatorId,
      roomId: savedRoom.id,
      role: MemberRole.ADMIN,
    });

    return savedRoom;
  }

  async findAll(): Promise<Room[]> {
    return this.roomsRepository.find({
      relations: ['creator', 'members', 'members.user'],
      where: { isPrivate: false },
    });
  }

  async findUserRooms(userId: string): Promise<Room[]> {
    const rooms = await this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('room.creator', 'creator')
      .where('member.userId = :userId', { userId })
      .getMany();

    return rooms;
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['creator', 'members', 'members.user'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, userId: string): Promise<Room> {
    const room = await this.findOne(id);
    
    // Check if user has permission to update
    const member = await this.roomMembersRepository.findOne({
      where: { roomId: id, userId },
    });

    if (!member || (member.role !== MemberRole.ADMIN && room.createdBy !== userId)) {
      throw new ForbiddenException('You do not have permission to update this room');
    }

    Object.assign(room, updateRoomDto);
    return this.roomsRepository.save(room);
  }

  async joinRoom(roomId: string, userId: string): Promise<RoomMember> {
    const room = await this.findOne(roomId);
    
    const existingMember = await this.roomMembersRepository.findOne({
      where: { roomId, userId },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this room');
    }

    const member = this.roomMembersRepository.create({
      userId,
      roomId,
      role: MemberRole.MEMBER,
    });

    return this.roomMembersRepository.save(member);
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const member = await this.roomMembersRepository.findOne({
      where: { roomId, userId },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this room');
    }

    await this.roomMembersRepository.remove(member);
  }

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    return this.roomMembersRepository.find({
      where: { roomId },
      relations: ['user'],
    });
  }

  async isUserMember(roomId: string, userId: string): Promise<boolean> {
    const member = await this.roomMembersRepository.findOne({
      where: { roomId, userId },
    });
    return !!member;
  }

  async remove(id: string, userId: string): Promise<void> {
    const room = await this.findOne(id);
    
    if (room.createdBy !== userId) {
      throw new ForbiddenException('Only the room creator can delete this room');
    }

    await this.roomsRepository.remove(room);
  }
}