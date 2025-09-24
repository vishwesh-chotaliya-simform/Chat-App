import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    return this.roomsService.create(createRoomDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('my-rooms')
  findUserRooms(@Request() req) {
    return this.roomsService.findUserRooms(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Get(':id/members')
  getRoomMembers(@Param('id') id: string) {
    return this.roomsService.getRoomMembers(id);
  }

  @Post(':id/join')
  joinRoom(@Param('id') id: string, @Request() req) {
    return this.roomsService.joinRoom(id, req.user.userId);
  }

  @Delete(':id/leave')
  leaveRoom(@Param('id') id: string, @Request() req) {
    return this.roomsService.leaveRoom(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto, @Request() req) {
    return this.roomsService.update(id, updateRoomDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.roomsService.remove(id, req.user.userId);
  }
}