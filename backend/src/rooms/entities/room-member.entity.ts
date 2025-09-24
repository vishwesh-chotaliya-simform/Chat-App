import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from './room.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  roomId: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER
  })
  role: MemberRole;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => User, user => user.roomMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Room, room => room.members)
  @JoinColumn({ name: 'roomId' })
  room: Room;
}