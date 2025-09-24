// filepath: src/rooms/entities/room.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from '../../chat/entities/message.entity';
import { RoomMember } from './room-member.entity';
import { User } from '../../users/entities/user.entity';

export enum RoomType {
  DIRECT = 'direct',
  GROUP = 'group',
  PUBLIC = 'public'
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.GROUP
  })
  type: RoomType;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, message => message.room)
  messages: Message[];

  @OneToMany(() => RoomMember, roomMember => roomMember.room)
  members: RoomMember[];
}