"use client";

import {
  getConversationMessages,
  getConversations,
  getRealtimeConnectionInfo,
  getUnreadMessageCount,
  markMessageRead,
  sendImageMessage,
  sendTextMessage,
  type Conversation,
  type DirectMessage,
  type MessagePagination,
  type MessageUser,
} from "@/app/services/message.action";
import type { Socket } from "socket.io-client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ConversationList from "./ConversationList";
import MessageThread, { EmptyMessageThread } from "./MessageThread";
import {
  getConversationPartner,
  getPartnerFromMessages,
  mergeConversations,
  mergeMessages,
  normalizeSocketMessage,
} from "./message-utils";
import NewConversationDialog from "./NewConversationDialog";

type MessagesWorkspaceProps = {
  currentUser: MessageUser;
  initialConversationError?: string;
  initialConversationPagination: MessagePagination;
  initialConversations: Conversation[];
  initialMessageError?: string;
  initialMessagePagination: MessagePagination;
  initialMessages: DirectMessage[];
  initialUnreadCount: number;
  selectedConversationId?: string;
};

export default function MessagesWorkspace({
  currentUser,
  initialConversationError,
  initialConversationPagination,
  initialConversations,
  initialMessageError,
  initialMessagePagination,
  initialMessages,
  initialUnreadCount,
  selectedConversationId,
}: MessagesWorkspaceProps) {
  const [conversations, setConversations] = useState(() =>
    initialConversations.map((conversation) =>
      conversation._id === selectedConversationId
        ? { ...conversation, unreadCount: 0 }
        : conversation,
    ),
  );
  const [conversationPagination, setConversationPagination] = useState(
    initialConversationPagination,
  );
  const [messages, setMessages] = useState(() =>
    mergeMessages([], initialMessages),
  );
  const [messagePagination, setMessagePagination] = useState(
    initialMessagePagination,
  );
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [listError, setListError] = useState(initialConversationError);
  const [threadError, setThreadError] = useState(initialMessageError);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingStatus, setTypingStatus] = useState<{
    conversationId: string;
    userId: string;
  } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation._id === selectedConversationId,
      ),
    [conversations, selectedConversationId],
  );
  const partner = useMemo(
    () =>
      getConversationPartner(selectedConversation, currentUser._id) ??
      getPartnerFromMessages(messages, currentUser._id),
    [currentUser._id, messages, selectedConversation],
  );
  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const refreshConversationSummary = useCallback(async () => {
    const [conversationResult, unreadResult] = await Promise.all([
      getConversations(1, 30),
      getUnreadMessageCount(),
    ]);

    if (conversationResult.success) {
      setConversations((current) =>
        mergeConversations(current, conversationResult.data.conversations).map(
          (conversation) =>
            conversation._id === selectedConversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation,
        ),
      );
      setConversationPagination((current) => ({
        ...conversationResult.data.pagination,
        currentPage: Math.max(
          current.currentPage,
          conversationResult.data.pagination.currentPage,
        ),
      }));
      setListError(undefined);
    }

    if (unreadResult.success) {
      setUnreadCount(unreadResult.data.unreadCount);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    let isActive = true;
    let activeSocket: Socket | null = null;

    const connectRealtime = async () => {
      const connectionInfo = await getRealtimeConnectionInfo();
      if (!connectionInfo.success || !isActive) return;

      const { io } = await import("socket.io-client");
      if (!isActive) return;

      const socket = io(connectionInfo.data.url, {
        auth: { token: connectionInfo.data.token },
        transports: ["websocket", "polling"],
      });
      activeSocket = socket;
      socketRef.current = socket;

      socket.on("new_message", (value: unknown) => {
        const message = normalizeSocketMessage(value);
        if (!message || !isActive) return;

        if (message.conversationId === selectedConversationId) {
          setMessages((current) => mergeMessages(current, [message]));

          if (message.senderId._id !== currentUser._id) {
            void markMessageRead(message._id);
          }
        } else if (message.senderId._id !== currentUser._id) {
          setUnreadCount((current) => current + 1);
        }

        void refreshConversationSummary();
      });

      socket.on(
        "user_typing",
        (value: { conversationId?: string; userId?: string }) => {
          if (
            value.conversationId &&
            value.userId &&
            value.userId !== currentUser._id
          ) {
            setTypingStatus({
              conversationId: value.conversationId,
              userId: value.userId,
            });
          }
        },
      );

      socket.on(
        "user_stop_typing",
        (value: { conversationId?: string; userId?: string }) => {
          setTypingStatus((current) =>
            current?.conversationId === value.conversationId &&
            current?.userId === value.userId
              ? null
              : current,
          );
        },
      );
    };

    void connectRealtime();

    return () => {
      isActive = false;
      activeSocket?.disconnect();
      if (socketRef.current === activeSocket) {
        socketRef.current = null;
      }
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    currentUser._id,
    refreshConversationSummary,
    selectedConversationId,
  ]);

  useEffect(() => {
    let isActive = true;
    let isPolling = false;

    const pollMessages = async () => {
      if (isPolling) {
        return;
      }

      isPolling = true;

      try {
        if (selectedConversationId) {
          const messageResult = await getConversationMessages(
            selectedConversationId,
            1,
            50,
          );

          if (isActive && messageResult.success) {
            const unreadIncomingMessages = messageResult.data.messages.filter(
              (message) =>
                message.senderId._id !== currentUser._id && !message.isRead,
            );

            if (unreadIncomingMessages.length) {
              await Promise.all(
                unreadIncomingMessages.map((message) =>
                  markMessageRead(message._id),
                ),
              );
            }

            const refreshedMessages = messageResult.data.messages.map(
              (message) =>
                message.senderId._id !== currentUser._id
                  ? { ...message, isRead: true }
                  : message,
            );

            if (isActive) {
              setMessages((current) =>
                mergeMessages(current, refreshedMessages),
              );
            }
          }
        }

        if (isActive) {
          await refreshConversationSummary();
        }
      } finally {
        isPolling = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void pollMessages();
    }, 6_000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [
    currentUser._id,
    refreshConversationSummary,
    selectedConversationId,
  ]);

  const loadMoreConversations = async () => {
    if (isLoadingConversations || !conversationPagination.hasMore) {
      return;
    }

    setIsLoadingConversations(true);
    setListError(undefined);

    try {
      const result = await getConversations(
        conversationPagination.currentPage + 1,
        30,
      );

      if (!result.success) {
        setListError(result.message);
        return;
      }

      setConversations((current) =>
        mergeConversations(current, result.data.conversations),
      );
      setConversationPagination(result.data.pagination);
    } catch {
      setListError("Không thể tải thêm cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadOlderMessages = async () => {
    if (
      !selectedConversationId ||
      isLoadingOlder ||
      !messagePagination.hasMore
    ) {
      return;
    }

    setIsLoadingOlder(true);
    setThreadError(undefined);

    try {
      const result = await getConversationMessages(
        selectedConversationId,
        messagePagination.currentPage + 1,
        50,
      );

      if (!result.success) {
        setThreadError(result.message);
        return;
      }

      setMessages((current) => mergeMessages(current, result.data.messages));
      setMessagePagination(result.data.pagination);
    } catch {
      setThreadError("Không thể tải tin nhắn cũ. Vui lòng thử lại.");
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const sendText = async (content: string) => {
    if (!selectedConversationId || !partner?._id) {
      setThreadError("Không xác định được người nhận tin nhắn.");
      return false;
    }

    setIsSending(true);
    setThreadError(undefined);

    try {
      const result = await sendTextMessage({
        content,
        conversationId: selectedConversationId,
        recipientId: partner._id,
      });

      if (!result.success) {
        setThreadError(result.message);
        return false;
      }

      setMessages((current) => mergeMessages(current, [result.data]));
      void refreshConversationSummary();
      return true;
    } catch {
      setThreadError("Không thể gửi tin nhắn. Vui lòng thử lại.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const sendImage = async (image: File) => {
    if (!selectedConversationId || !partner?._id) {
      setThreadError("Không xác định được người nhận ảnh.");
      return false;
    }

    if (!["image/gif", "image/jpeg", "image/png"].includes(image.type)) {
      setThreadError("Ảnh phải có định dạng JPG, PNG hoặc GIF.");
      return false;
    }

    if (image.size > 10 * 1024 * 1024) {
      setThreadError("Ảnh không được lớn hơn 10 MB.");
      return false;
    }

    setIsSending(true);
    setThreadError(undefined);

    try {
      const formData = new FormData();
      formData.set("conversationId", selectedConversationId);
      formData.set("recipientId", partner._id);
      formData.set("image", image);

      const result = await sendImageMessage(formData);

      if (!result.success) {
        setThreadError(result.message);
        return false;
      }

      setMessages((current) => mergeMessages(current, [result.data]));
      void refreshConversationSummary();
      return true;
    } catch {
      setThreadError("Không thể gửi ảnh. Vui lòng thử lại.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const updateTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!selectedConversationId || !partner?._id) return;

      const socket = socketRef.current;
      if (!socket?.connected) return;

      const payload = {
        conversationId: selectedConversationId,
        recipientId: partner._id,
      };

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socket.emit(isTyping ? "typing" : "stop_typing", payload);

      if (isTyping) {
        typingTimeoutRef.current = window.setTimeout(() => {
          socket.emit("stop_typing", payload);
          typingTimeoutRef.current = null;
        }, 1_500);
      }
    },
    [partner, selectedConversationId],
  );

  const isPartnerTyping =
    typingStatus !== null &&
    Boolean(selectedConversationId) &&
    typingStatus?.conversationId === selectedConversationId &&
    typingStatus.userId === partner?._id;

  return (
    <>
      <div className="mx-auto grid h-[calc(100dvh-7.5rem)] w-full min-w-0 overflow-hidden bg-[var(--app-background)] md:grid-cols-[320px_minmax(0,1fr)] lg:h-dvh xl:max-w-[1280px] xl:border-x xl:border-[var(--app-border)]">
        <ConversationList
          conversations={conversations}
          currentUserId={currentUser._id}
          error={listError}
          hasMore={conversationPagination.hasMore}
          isLoadingMore={isLoadingConversations}
          onLoadMore={() => void loadMoreConversations()}
          onNewConversation={() => setIsDialogOpen(true)}
          selectedConversationId={selectedConversationId}
          unreadCount={unreadCount}
        />

        {selectedConversationId && partner ? (
          <MessageThread
            currentUserId={currentUser._id}
            error={threadError}
            isLoadingOlder={isLoadingOlder}
            isPartnerTyping={isPartnerTyping}
            isSending={isSending}
            messages={messages}
            onLoadOlder={() => void loadOlderMessages()}
            onSendImage={sendImage}
            onSendText={sendText}
            onTypingChange={updateTypingStatus}
            pagination={messagePagination}
            partner={partner}
          />
        ) : selectedConversationId ? (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-semibold text-[var(--app-text)]">
              Không tìm thấy người tham gia cuộc trò chuyện.
            </p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Hãy quay lại danh sách và chọn một cuộc trò chuyện khác.
            </p>
          </section>
        ) : (
          <EmptyMessageThread />
        )}
      </div>

      <NewConversationDialog onClose={closeDialog} open={isDialogOpen} />
    </>
  );
}
