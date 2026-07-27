import "server-only";

import { getCurrentUser } from "@/app/services/auth.action";
import {
  getConversationMessages,
  getConversations,
  getUnreadMessageCount,
  type MessagePagination,
  type MessageUser,
} from "@/app/services/message.action";

type CurrentUserResponse = Partial<MessageUser> & {
  email?: string;
  name?: string;
};

const emptyPagination: MessagePagination = {
  currentPage: 1,
  hasMore: false,
  totalItems: 0,
  totalPages: 1,
};

function normalizeCurrentUser(user: CurrentUserResponse | null): MessageUser {
  const username =
    user?.username?.trim() || user?.email?.split("@")[0] || "instagram";

  return {
    _id: user?._id ?? "",
    fullName: user?.fullName?.trim() || user?.name?.trim() || username,
    profilePicture: user?.profilePicture,
    username,
  };
}

export async function getMessagePageData(selectedConversationId?: string) {
  const [currentUserResponse, conversationResult, messageResult] =
    await Promise.all([
      getCurrentUser().catch(() => null) as Promise<CurrentUserResponse | null>,
      getConversations(1, 30),
      selectedConversationId
        ? getConversationMessages(selectedConversationId, 1, 50)
        : Promise.resolve(null),
    ]);
  const unreadResult = await getUnreadMessageCount();

  return {
    currentUser: normalizeCurrentUser(currentUserResponse),
    initialConversationError: conversationResult.success
      ? undefined
      : conversationResult.message,
    initialConversationPagination: conversationResult.success
      ? conversationResult.data.pagination
      : emptyPagination,
    initialConversations: conversationResult.success
      ? conversationResult.data.conversations
      : [],
    initialMessageError:
      messageResult && !messageResult.success
        ? messageResult.message
        : undefined,
    initialMessagePagination:
      messageResult?.success
        ? messageResult.data.pagination
        : emptyPagination,
    initialMessages:
      messageResult?.success ? messageResult.data.messages : [],
    initialUnreadCount: unreadResult.success
      ? unreadResult.data.unreadCount
      : 0,
    selectedConversationId,
  };
}
