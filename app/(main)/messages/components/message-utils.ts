import type {
  Conversation,
  DirectMessage,
  MessageUser,
} from "@/app/services/message.action";

export function getInitial(user?: MessageUser | null) {
  const label = user?.fullName?.trim() || user?.username.trim() || "I";
  return label.charAt(0).toUpperCase();
}

export function getConversationPartner(
  conversation: Conversation | undefined,
  currentUserId: string,
) {
  return (
    conversation?.participants.find(
      (participant) => participant._id !== currentUserId,
    ) ?? conversation?.participants[0]
  );
}

export function getPartnerFromMessages(
  messages: DirectMessage[],
  currentUserId: string,
): MessageUser | undefined {
  const incomingMessage = messages.find(
    (message) => message.senderId._id !== currentUserId,
  );

  if (incomingMessage) {
    return incomingMessage.senderId;
  }

  const recipientId = messages.find((message) => message.recipientId)?.recipientId;

  if (!recipientId) {
    return undefined;
  }

  return {
    _id: recipientId,
    fullName: "Người dùng Instagram",
    username: `user_${recipientId.slice(-6)}`,
  };
}

export function mergeMessages(
  currentMessages: DirectMessage[],
  nextMessages: DirectMessage[],
) {
  const messagesById = new Map(
    currentMessages.map((message) => [message._id, message]),
  );

  for (const message of nextMessages) {
    messagesById.set(message._id, message);
  }

  return [...messagesById.values()].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
      new Date(second.createdAt).getTime(),
  );
}

export function mergeConversations(
  currentConversations: Conversation[],
  nextConversations: Conversation[],
) {
  const conversationsById = new Map(
    currentConversations.map((conversation) => [
      conversation._id,
      conversation,
    ]),
  );

  for (const conversation of nextConversations) {
    conversationsById.set(conversation._id, conversation);
  }

  return [...conversationsById.values()].sort(
    (first, second) =>
      new Date(second.lastMessageAt).getTime() -
      new Date(first.lastMessageAt).getTime(),
  );
}

export function normalizeSocketMessage(value: unknown): DirectMessage | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const senderValue = raw.senderId;
  const sender =
    senderValue && typeof senderValue === "object"
      ? (senderValue as Record<string, unknown>)
      : null;
  const senderId =
    typeof senderValue === "string"
      ? senderValue
      : typeof sender?._id === "string"
        ? sender._id
        : "";
  const id = typeof raw._id === "string" ? raw._id : "";
  const conversationId =
    typeof raw.conversationId === "string" ? raw.conversationId : "";

  if (!id || !conversationId || !senderId) {
    return null;
  }

  return {
    _id: id,
    content: typeof raw.content === "string" ? raw.content : null,
    conversationId,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : null,
    isRead: Boolean(raw.isRead),
    messageType: raw.messageType === "image" ? "image" : "text",
    recipientId:
      typeof raw.recipientId === "string"
        ? raw.recipientId
        : "",
    senderId: {
      _id: senderId,
      fullName:
        typeof sender?.fullName === "string" ? sender.fullName : null,
      profilePicture:
        typeof sender?.profilePicture === "string"
          ? sender.profilePicture
          : null,
      username:
        typeof sender?.username === "string" && sender.username
          ? sender.username
          : `user_${senderId.slice(-6)}`,
    },
  };
}

export function formatConversationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
