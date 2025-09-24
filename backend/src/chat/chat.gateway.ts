import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(
          `Client ${client.id} disconnected: Invalid token payload`
        );
        client.disconnect();
        return;
      }

      client.userId = userId;
      this.connectedUsers.set(client.id, userId);

      await this.usersService.updateOnlineStatus(userId, true);

      client.emit("connected", { message: "Connected successfully" });
      this.server.emit("userOnline", { userId });

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}:`,
        error.message
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      await this.usersService.updateOnlineStatus(userId, false);
      this.server.emit("userOffline", { userId });
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ): void {
    const userId = this.connectedUsers.get(client.id);

    client.join(data.roomId);
    client.emit("joinedRoom", { roomId: data.roomId });

    this.logger.log(
      `🚪 Socket ${client.id} (User: ${userId}) joined room ${data.roomId}`
    );
  }

  @SubscribeMessage("leaveRoom")
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ): void {
    const userId = this.connectedUsers.get(client.id);

    client.leave(data.roomId);
    client.emit("leftRoom", { roomId: data.roomId });

    this.logger.log(
      `🚪 Socket ${client.id} (User: ${userId}) left room ${data.roomId}`
    );
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() createMessageDto: CreateMessageDto
  ): Promise<void> {
    // This should be triggered when frontend calls socketService.sendMessage()
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit("error", { message: "Unauthorized" });
        return;
      }

      // FORCE join the room multiple times to be sure
      client.join(createMessageDto.roomId);
      client.join(createMessageDto.roomId);
      client.join(createMessageDto.roomId);

      const message = await this.chatService.create(createMessageDto, userId);
      console.log(message, "message");
      const messageWithSender = await this.chatService.findMessageWithSender(
        message.id
      );

      // Send using multiple methods to ensure delivery
      // Method 1: To everyone in room including sender
      this.server
        .in(createMessageDto.roomId)
        .emit("newMessage", messageWithSender);

      // Method 2: Direct to sender as backup
      client.emit("newMessage", messageWithSender);

      // Method 3: To all connected clients in room via server
      this.server
        .to(createMessageDto.roomId)
        .emit("newMessage", messageWithSender);

      this.logger.log(`📡 Message sent using multiple methods`);
    } catch (error: any) {
      this.logger.error("❌ Error handling message:", error);
      client.emit("error", { message: error.message });
    }
  }

  @SubscribeMessage("typing")
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean }
  ): void {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      // Send typing to others in room (excluding sender)
      client.to(data.roomId).emit("userTyping", {
        userId,
        roomId: data.roomId,
        isTyping: data.isTyping,
      });
    }
  }
}
