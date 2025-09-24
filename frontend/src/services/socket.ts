// Create: frontend/src/services/socket.ts
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { Message } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private joinedRooms: Set<string> = new Set();

  connect(token: string): void {
    try {
      console.log("🔌 Attempting to connect to Socket.IO server...");
      const socketUrl =
        process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";

      this.socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        forceNew: true,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to server with socket ID:", this.socket?.id);

        // Re-join all previously joined rooms
        this.joinedRooms.forEach((roomId) => {
          console.log(`🔄 Re-joining room: ${roomId}`);
          this.socket?.emit("joinRoom", { roomId });
        });
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from server. Reason:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
      });

      this.socket.on("error", (error: any) => {
        console.error("❌ Socket error:", error);
      });

      // Set up specific event listeners with detailed logging
      this.socket.on("newMessage", (message: Message) => {
        console.log("📨 FRONTEND RECEIVED newMessage:", {
          id: message.id,
          content: message.content,
          sender: message.sender?.username,
          roomId: message.roomId,
        });
        this.emit("newMessage", message);
      });

      this.socket.on("userTyping", (data) => {
        console.log("⌨️ FRONTEND RECEIVED userTyping:", data);
        this.emit("userTyping", data);
      });

      this.setupEventForwarding();
    } catch (error) {
      console.error("❌ Socket connection failed:", error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.joinedRooms.clear();
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    const events = [
      "connected",
      "userOnline",
      "userOffline",
      "joinedRoom",
      "leftRoom",
    ];

    events.forEach((event) => {
      this.socket!.on(event, (data: any) => {
        console.log(`📨 Received ${event}:`, data);
        this.emit(event, data);
      });
    });
  }

  on(event: string, callback: Function): void {
    console.log(`🎧 Adding listener for event: ${event}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners && eventListeners.length > 0) {
      console.log(`🔄 Emitting ${event} to ${eventListeners.length} listeners`);
      eventListeners.forEach((callback) => callback(data));
    } else {
      console.warn(`⚠️ No listeners for event: ${event}`);
    }
  }

  joinRoom(roomId: string): void {
    if (this.socket?.connected) {
      console.log(`🚪 JOINING ROOM: ${roomId}`);
      this.socket.emit("joinRoom", { roomId });
      this.joinedRooms.add(roomId);
    } else {
      console.warn("Socket not connected, queueing room join:", roomId);
      this.joinedRooms.add(roomId);
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      console.log(`🚪 LEAVING ROOM: ${roomId}`);
      this.socket.emit("leaveRoom", { roomId });
    }
    this.joinedRooms.delete(roomId);
  }

  sendMessage(message: {
    content: string;
    roomId: string;
    type?: string;
  }): void {
    if (this.socket?.connected) {
      console.log(
        `💬 SENDING MESSAGE to room ${message.roomId}:`,
        message.content
      );

      // Ensure we're in the room before sending
      if (!this.joinedRooms.has(message.roomId)) {
        console.log(
          `🔄 Auto-joining room ${message.roomId} before sending message`
        );
        this.joinRoom(message.roomId);
      }

      // Send message
      this.socket.emit("sendMessage", message);
    } else {
      console.error("❌ Socket not connected, cannot send message");
    }
  }

  sendTyping(roomId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit("typing", { roomId, isTyping });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
