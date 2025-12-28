export const API_ENDPOINTS = {
  USERS: "/users",
  AUTH: "/auth",
  HEALTH: "/health",
  MESSAGES: "/messages",
  CONVERSATIONS: "/conversations",
} as const;

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Messaging
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",
  SEND_MESSAGE: "send_message",
  MESSAGE_RECEIVED: "message_received",
  MESSAGE_DELETED: "message_deleted",
  MESSAGE_EDITED: "message_edited",

  // Typing indicators
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  USER_TYPING: "user_typing",

  // Presence
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
} as const;
