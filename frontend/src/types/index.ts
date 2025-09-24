// Create: frontend/src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: "direct" | "group" | "public";
  avatar?: string;
  isPrivate: boolean;
  createdBy: string;
  creator: User;
  members: RoomMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  role: "admin" | "moderator" | "member";
  lastReadAt?: Date;
  joinedAt: Date;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  senderId: string;
  roomId: string;
  fileName?: string;
  fileUrl?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: User;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}
