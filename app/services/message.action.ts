"use server";

import {
  apiRequest,
  getApiBaseUrl,
  type ApiResult,
} from "@/app/services/api-client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type MessageUser = {
  _id: string;
  fullName?: string | null;
  profilePicture?: string | null;
  username: string;
};

export type ConversationLastMessage = {
  _id: string;
  content?: string | null;
  createdAt: string;
  imageUrl?: string | null;
  isRead: boolean;
  messageType: "image" | "text";
  senderId: string;
};

export type Conversation = {
  _id: string;
  createdAt: string;
  lastMessage: ConversationLastMessage | null;
  lastMessageAt: string;
  participants: MessageUser[];
  unreadCount: number;
};

export type DirectMessage = {
  _id: string;
  content?: string | null;
  conversationId: string;
  createdAt: string;
  imageUrl?: string | null;
  isRead: boolean;
  messageType: "image" | "text";
  recipientId: string;
  senderId: MessageUser;
};

export type MessagePagination = {
  currentPage: number;
  hasMore: boolean;
  totalItems: number;
  totalPages: number;
};

export type ConversationListData = {
  conversations: Conversation[];
  pagination: MessagePagination;
};

export type ConversationMessagesData = {
  messages: DirectMessage[];
  pagination: MessagePagination;
};

export type SendTextMessageInput = {
  content: string;
  conversationId: string;
  recipientId: string;
};

type RawUser = Partial<MessageUser>;

type RawLastMessage = {
  _id?: string;
  content?: string | null;
  createdAt?: string;
  imageUrl?: string | null;
  isRead?: boolean;
  messageType?: string;
  senderId?: RawUser | string;
};

type RawConversation = {
  _id?: string;
  createdAt?: string;
  lastMessage?: RawLastMessage | null;
  lastMessageAt?: string;
  participants?: RawUser[];
  unreadCount?: number;
};

type RawMessage = {
  _id?: string;
  content?: string | null;
  conversationId?: string;
  createdAt?: string;
  imageUrl?: string | null;
  isRead?: boolean;
  messageType?: string;
  recipientId?: RawUser | string;
  senderId?: RawUser | string;
};

type RawPagination = {
  currentPage?: number;
  hasMore?: boolean;
  totalConversations?: number;
  totalItems?: number;
  totalMessages?: number;
  totalPages?: number;
};

type RawConversationListData = {
  conversations?: RawConversation[];
  pagination?: RawPagination;
};

type RawConversationMessagesData = {
  messages?: RawMessage[];
  pagination?: RawPagination;
};

const maxImageSize = 10 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/gif", "image/jpeg", "image/png"]);

function validationError<T>(message: string): ApiResult<T> {
  return {
    message,
    status: 400,
    success: false,
  };
}

function normalizeId(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUser(user?: RawUser | string): MessageUser {
  const id = typeof user === "string" ? user : normalizeId(user?._id);
  const shortId = id.slice(-6) || "instagram";

  return {
    _id: id,
    fullName: typeof user === "object" ? user.fullName : null,
    profilePicture: typeof user === "object" ? user.profilePicture : null,
    username:
      typeof user === "object" && user.username?.trim()
        ? user.username
        : `user_${shortId}`,
  };
}

function normalizeLastMessage(
  message?: RawLastMessage | null,
): ConversationLastMessage | null {
  if (!message?._id) {
    return null;
  }

  return {
    _id: message._id,
    content: message.content,
    createdAt: message.createdAt ?? "",
    imageUrl: message.imageUrl,
    isRead: Boolean(message.isRead),
    messageType: message.messageType === "image" ? "image" : "text",
    senderId:
      typeof message.senderId === "string"
        ? message.senderId
        : normalizeId(message.senderId?._id),
  };
}

function normalizeConversation(conversation: RawConversation): Conversation {
  return {
    _id: normalizeId(conversation._id),
    createdAt: conversation.createdAt ?? "",
    lastMessage: normalizeLastMessage(conversation.lastMessage),
    lastMessageAt:
      conversation.lastMessageAt ??
      conversation.lastMessage?.createdAt ??
      conversation.createdAt ??
      "",
    participants: (conversation.participants ?? []).map((participant) =>
      normalizeUser(participant),
    ),
    unreadCount: Math.max(0, Number(conversation.unreadCount) || 0),
  };
}

function normalizeMessage(message: RawMessage): DirectMessage {
  const recipientId =
    typeof message.recipientId === "string"
      ? message.recipientId
      : normalizeId(message.recipientId?._id);

  return {
    _id: normalizeId(message._id),
    content: message.content,
    conversationId: normalizeId(message.conversationId),
    createdAt: message.createdAt ?? "",
    imageUrl: message.imageUrl,
    isRead: Boolean(message.isRead),
    messageType: message.messageType === "image" ? "image" : "text",
    recipientId,
    senderId: normalizeUser(message.senderId),
  };
}

function normalizePagination(
  pagination: RawPagination | undefined,
  itemCount: number,
): MessagePagination {
  return {
    currentPage: Math.max(1, Number(pagination?.currentPage) || 1),
    hasMore: Boolean(pagination?.hasMore),
    totalItems: Math.max(
      itemCount,
      Number(
        pagination?.totalItems ??
          pagination?.totalMessages ??
          pagination?.totalConversations,
      ) || 0,
    ),
    totalPages: Math.max(1, Number(pagination?.totalPages) || 1),
  };
}

function safePage(value: number) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

function safeLimit(value: number, fallback: number) {
  return Math.min(100, Math.max(1, Math.floor(Number(value) || fallback)));
}

export async function getConversations(
  page = 1,
  limit = 30,
): Promise<ApiResult<ConversationListData>> {
  const result = await apiRequest<RawConversationListData>(
    `/api/messages/conversations?page=${safePage(page)}&limit=${safeLimit(limit, 30)}`,
    {},
    { auth: true },
  );

  if (!result.success) {
    return result;
  }

  const conversations = (result.data.conversations ?? [])
    .map(normalizeConversation)
    .filter((conversation) => conversation._id);

  return {
    ...result,
    data: {
      conversations,
      pagination: normalizePagination(result.data.pagination, conversations.length),
    },
  };
}

export async function createOrGetConversation(
  userId: string,
): Promise<ApiResult<Conversation>> {
  const normalizedUserId = normalizeId(userId);

  if (!normalizedUserId) {
    return validationError("Vui lòng nhập ID người dùng.");
  }

  const result = await apiRequest<RawConversation>(
    "/api/messages/conversations",
    {
      body: JSON.stringify({ userId: normalizedUserId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    { auth: true },
  );

  if (!result.success) {
    return result;
  }

  const conversation = normalizeConversation(result.data);

  if (!conversation._id) {
    return validationError("Máy chủ không trả về cuộc trò chuyện hợp lệ.");
  }

  revalidatePath("/messages");

  return {
    ...result,
    data: conversation,
  };
}

export async function getConversationMessages(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<ApiResult<ConversationMessagesData>> {
  const normalizedConversationId = normalizeId(conversationId);

  if (!normalizedConversationId) {
    return validationError("Cuộc trò chuyện không hợp lệ.");
  }

  const result = await apiRequest<RawConversationMessagesData>(
    `/api/messages/conversations/${encodeURIComponent(normalizedConversationId)}/messages?page=${safePage(page)}&limit=${safeLimit(limit, 50)}`,
    {},
    { auth: true },
  );

  if (!result.success) {
    return result;
  }

  const messages = (result.data.messages ?? [])
    .map(normalizeMessage)
    .filter((message) => message._id);

  return {
    ...result,
    data: {
      messages,
      pagination: normalizePagination(result.data.pagination, messages.length),
    },
  };
}

export async function sendTextMessage(
  input: SendTextMessageInput,
): Promise<ApiResult<DirectMessage>> {
  const conversationId = normalizeId(input.conversationId);
  const recipientId = normalizeId(input.recipientId);
  const content = input.content.trim();

  if (!conversationId || !recipientId) {
    return validationError("Không xác định được cuộc trò chuyện hoặc người nhận.");
  }

  if (!content) {
    return validationError("Vui lòng nhập nội dung tin nhắn.");
  }

  if (content.length > 5_000) {
    return validationError("Tin nhắn không được dài quá 5.000 ký tự.");
  }

  const result = await apiRequest<RawMessage>(
    "/api/messages/messages",
    {
      body: JSON.stringify({
        content,
        conversationId,
        messageType: "text",
        recipientId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    { auth: true },
  );

  if (!result.success) {
    return result;
  }

  revalidatePath("/messages");

  return {
    ...result,
    data: normalizeMessage(result.data),
  };
}

export async function sendImageMessage(
  formData: FormData,
): Promise<ApiResult<DirectMessage>> {
  const conversationId = normalizeId(formData.get("conversationId"));
  const recipientId = normalizeId(formData.get("recipientId"));
  const image = formData.get("image");

  if (!conversationId || !recipientId) {
    return validationError("Không xác định được cuộc trò chuyện hoặc người nhận.");
  }

  if (!(image instanceof File) || image.size === 0) {
    return validationError("Vui lòng chọn một ảnh.");
  }

  if (!acceptedImageTypes.has(image.type)) {
    return validationError("Ảnh phải có định dạng JPG, PNG hoặc GIF.");
  }

  if (image.size > maxImageSize) {
    return validationError("Ảnh không được lớn hơn 10 MB.");
  }

  const payload = new FormData();
  payload.set("conversationId", conversationId);
  payload.set("recipientId", recipientId);
  payload.set("messageType", "image");
  payload.set("image", image);

  const result = await apiRequest<RawMessage>(
    "/api/messages/messages",
    {
      body: payload,
      method: "POST",
    },
    { auth: true },
  );

  if (!result.success) {
    return result;
  }

  revalidatePath("/messages");

  return {
    ...result,
    data: normalizeMessage(result.data),
  };
}

export async function markMessageRead(
  messageId: string,
): Promise<ApiResult<{ _id: string; isRead: boolean }>> {
  const normalizedMessageId = normalizeId(messageId);

  if (!normalizedMessageId) {
    return validationError("Tin nhắn không hợp lệ.");
  }

  return apiRequest<{ _id: string; isRead: boolean }>(
    `/api/messages/messages/${encodeURIComponent(normalizedMessageId)}/read`,
    {
      method: "PUT",
    },
    { auth: true },
  );
}

export async function getUnreadMessageCount(): Promise<
  ApiResult<{ unreadCount: number }>
> {
  const result = await apiRequest<{ unreadCount?: number }>(
    "/api/messages/unread-count",
    {},
    { auth: true },
  );

  if (!result.success) {
    return result;
  }

  return {
    ...result,
    data: {
      unreadCount: Math.max(0, Number(result.data.unreadCount) || 0),
    },
  };
}

export async function getRealtimeConnectionInfo(): Promise<
  ApiResult<{ token: string; url: string }>
> {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return {
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      status: 401,
      success: false,
    };
  }

  return {
    data: {
      token,
      url: `${getApiBaseUrl()}/api`,
    },
    message: "Đã sẵn sàng kết nối tin nhắn thời gian thực.",
    status: 200,
    success: true,
  };
}
