import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS, Message, MessageEvent } from "@repo/shared";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId: string) => void;
  disconnect: () => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onMessageReceived: (callback: (message: Message) => void) => void;
  onUserTyping: (
    callback: (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => void
  ) => void;
  offMessageReceived: (callback: (message: Message) => void) => void;
  offUserTyping: (
    callback: (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => void
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = (userId: string) => {
    if (socketRef.current?.connected) return;

    socketRef.current = io("http://localhost:3000/chat", {
      query: { userId },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to chat server");
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from chat server");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, conversationId);
  };

  const sendMessage = (conversationId: string, content: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      conversationId,
      content,
      messageType: "text",
    });
  };

  const startTyping = (conversationId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
  };

  const stopTyping = (conversationId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
  };

  const onMessageReceived = (callback: (message: Message) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.MESSAGE_RECEIVED, callback);
  };

  const onUserTyping = (
    callback: (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => void
  ) => {
    socketRef.current?.on(SOCKET_EVENTS.USER_TYPING, callback);
  };

  const offMessageReceived = (callback: (message: Message) => void) => {
    socketRef.current?.off(SOCKET_EVENTS.MESSAGE_RECEIVED, callback);
  };

  const offUserTyping = (
    callback: (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => void
  ) => {
    socketRef.current?.off(SOCKET_EVENTS.USER_TYPING, callback);
  };

  useEffect(() => {
    // Auto-connect with a demo user ID
    connect("user-1");

    return () => {
      disconnect();
    };
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    onMessageReceived,
    onUserTyping,
    offMessageReceived,
    offUserTyping,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
