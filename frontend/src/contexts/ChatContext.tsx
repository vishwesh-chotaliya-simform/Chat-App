// Create: frontend/src/contexts/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Room, Message } from "../types";
import { roomsAPI, chatAPI } from "../services/api";
import { socketService } from "../services/socket";

interface ChatContextType {
  rooms: Room[];
  currentRoom: Room | null;
  messages: { [roomId: string]: Message[] };
  onlineUsers: Set<string>;
  typingUsers: { [roomId: string]: string[] };
  loading: boolean;
  setCurrentRoom: (room: Room | null) => void;
  sendMessage: (content: string, roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  createRoom: (data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }) => Promise<Room>;
  loadRoomMessages: (roomId: string) => Promise<void>;
  refreshRooms: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  isAuthenticated,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<{ [roomId: string]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<{
    [roomId: string]: string[];
  }>({});
  const [loading, setLoading] = useState(false);

  const handleNewMessage = useCallback((message: Message) => {
    console.log("🆕 Handling new message:", message);

    setMessages((prev) => {
      const existingMessages = prev[message.roomId] || [];

      // Check if message already exists by ID and content
      const messageExists = existingMessages.some(
        (msg) =>
          msg.id === message.id ||
          (msg.content === message.content &&
            msg.senderId === message.senderId &&
            Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(message.createdAt).getTime()
            ) < 1000)
      );

      if (messageExists) {
        console.log("⚠️ Message already exists, ignoring duplicate");
        return prev;
      }

      console.log(`✅ Adding message to room ${message.roomId}`);

      return {
        ...prev,
        [message.roomId]: [...existingMessages, message],
      };
    });
  }, []);

  const handleUserOnline = useCallback(({ userId }: { userId: string }) => {
    setOnlineUsers((prev) => new Set(prev).add(userId));
  }, []);

  const handleUserOffline = useCallback(({ userId }: { userId: string }) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleUserTyping = useCallback(
    ({
      userId,
      roomId,
      isTyping,
    }: {
      userId: string;
      roomId: string;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) => {
        const roomTyping = prev[roomId] || [];
        if (isTyping) {
          return {
            ...prev,
            [roomId]: roomTyping.includes(userId)
              ? roomTyping
              : [...roomTyping, userId],
          };
        } else {
          return {
            ...prev,
            [roomId]: roomTyping.filter((id) => id !== userId),
          };
        }
      });
    },
    []
  );

  const handleJoinedRoom = useCallback(({ roomId }: { roomId: string }) => {
    console.log(`Joined room: ${roomId}`);
  }, []);

  const setupSocketListeners = useCallback(() => {
    socketService.on("newMessage", handleNewMessage);
    socketService.on("userOnline", handleUserOnline);
    socketService.on("userOffline", handleUserOffline);
    socketService.on("userTyping", handleUserTyping);
    socketService.on("joinedRoom", handleJoinedRoom);
  }, [
    handleNewMessage,
    handleUserOnline,
    handleUserOffline,
    handleUserTyping,
    handleJoinedRoom,
  ]);

  const cleanupSocketListeners = useCallback(() => {
    socketService.off("newMessage", handleNewMessage);
    socketService.off("userOnline", handleUserOnline);
    socketService.off("userOffline", handleUserOffline);
    socketService.off("userTyping", handleUserTyping);
    socketService.off("joinedRoom", handleJoinedRoom);
  }, [
    handleNewMessage,
    handleUserOnline,
    handleUserOffline,
    handleUserTyping,
    handleJoinedRoom,
  ]);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getMyRooms();
      setRooms(response.data);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRooms = useCallback(async () => {
    await loadRooms();
  }, [loadRooms]);

  const loadRoomMessages = useCallback(async (roomId: string) => {
    try {
      const response = await chatAPI.getRoomMessages(roomId);
      setMessages((prev) => ({
        ...prev,
        [roomId]: response.data,
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, roomId: string) => {
    try {
      // Use socket service instead of HTTP API for real-time messaging
      socketService.sendMessage({ content, roomId });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }, []);

  const joinRoom = useCallback(
    async (roomId: string) => {
      try {
        await roomsAPI.join(roomId);
        socketService.joinRoom(roomId);
        await loadRoomMessages(roomId);
        await refreshRooms();
      } catch (error) {
        console.error("Error joining room:", error);
        throw error;
      }
    },
    [loadRoomMessages, refreshRooms]
  );

  const leaveRoom = useCallback(
    async (roomId: string) => {
      try {
        await roomsAPI.leave(roomId);
        socketService.leaveRoom(roomId);
        if (currentRoom?.id === roomId) {
          setCurrentRoom(null);
        }
        await refreshRooms();
      } catch (error) {
        console.error("Error leaving room:", error);
        throw error;
      }
    },
    [currentRoom, refreshRooms]
  );

  const createRoom = useCallback(
    async (data: {
      name: string;
      description?: string;
      isPrivate?: boolean;
    }): Promise<Room> => {
      try {
        const response = await roomsAPI.create(data);
        await refreshRooms();
        return response.data;
      } catch (error) {
        console.error("Error creating room:", error);
        throw error;
      }
    },
    [refreshRooms]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadRooms();
      setupSocketListeners();
    } else {
      // Clear state when not authenticated
      setRooms([]);
      setCurrentRoom(null);
      setMessages({});
      setOnlineUsers(new Set());
      setTypingUsers({});
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [
    isAuthenticated,
    loadRooms,
    setupSocketListeners,
    cleanupSocketListeners,
  ]);

  const value: ChatContextType = {
    rooms,
    currentRoom,
    messages,
    onlineUsers,
    typingUsers,
    loading,
    setCurrentRoom,
    sendMessage,
    joinRoom,
    leaveRoom,
    createRoom,
    loadRoomMessages,
    refreshRooms,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
