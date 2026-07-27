"use server";

import { cookies } from "next/headers";

export type CommentAuthor = {
  _id: string;
  fullName?: string | null;
  profilePicture?: string | null;
  username: string;
};

export type PostComment = {
  _id: string;
  content: string;
  createdAt: string;
  isLiked: boolean;
  likes: number;
  parentCommentId: string | null;
  postId: string;
  repliesCount: number;
  updatedAt?: string | null;
  user: CommentAuthor;
};

export type CommentPagination = {
  currentPage: number;
  hasMore: boolean;
  totalComments: number;
  totalPages: number;
};

export type ReplyPagination = {
  currentPage: number;
  hasMore: boolean;
  totalPages: number;
  totalReplies: number;
};

export type CommentListResult = {
  comments: PostComment[];
  error?: string;
  pagination: CommentPagination;
};

export type ReplyListResult = {
  error?: string;
  pagination: ReplyPagination;
  replies: PostComment[];
};

export type CommentMutationResult = {
  comment?: PostComment;
  error?: string;
  success: boolean;
};

export type CommentUpdateResult = {
  comment?: {
    _id: string;
    content: string;
    updatedAt?: string | null;
  };
  error?: string;
  success: boolean;
};

export type CommentDeleteResult = {
  error?: string;
  success: boolean;
};

export type CommentLikeResult = {
  error?: string;
  likes?: number;
  success: boolean;
};

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

type ApiComment = {
  _id?: string;
  content?: string;
  createdAt?: string;
  isLiked?: boolean;
  likedBy?: Array<string | { _id?: string }>;
  likes?: number;
  parentCommentId?: string | null;
  postId?: string;
  repliesCount?: number;
  updatedAt?: string | null;
  user?: CommentAuthor;
  userId?: CommentAuthor | string;
};

type ApiPagination = {
  currentPage?: number;
  hasMore?: boolean;
  totalComments?: number;
  totalPages?: number;
  totalReplies?: number;
};

const emptyCommentPagination: CommentPagination = {
  currentPage: 1,
  hasMore: false,
  totalComments: 0,
  totalPages: 0,
};

const emptyReplyPagination: ReplyPagination = {
  currentPage: 1,
  hasMore: false,
  totalPages: 0,
  totalReplies: 0,
};

function getApiBaseUrl() {
  return (
    process.env.SERVER_API ?? process.env.NEXT_PUBLIC_SERVER_API
  )?.replace(/\/+$/, "");
}

function cleanId(value: string) {
  return value.trim();
}

function cleanContent(value: string) {
  return value.trim();
}

function hasUserLiked(
  likedBy: ApiComment["likedBy"],
  currentUserId?: string,
) {
  if (!currentUserId || !Array.isArray(likedBy)) {
    return false;
  }

  return likedBy.some((entry) =>
    typeof entry === "string"
      ? entry === currentUserId
      : entry?._id === currentUserId,
  );
}

function normalizeAuthor(comment: ApiComment): CommentAuthor {
  const suppliedUser =
    comment.user ??
    (typeof comment.userId === "object" && comment.userId
      ? comment.userId
      : undefined);
  const fallbackId =
    typeof comment.userId === "string" ? comment.userId : "unknown";

  return {
    _id: suppliedUser?._id ?? fallbackId,
    fullName: suppliedUser?.fullName ?? null,
    profilePicture: suppliedUser?.profilePicture ?? null,
    username:
      suppliedUser?.username ??
      `user_${fallbackId === "unknown" ? "instagram" : fallbackId.slice(-6)}`,
  };
}

function normalizeComment(
  comment: ApiComment,
  currentUserId?: string,
): PostComment {
  return {
    _id: comment._id ?? "",
    content: comment.content ?? "",
    createdAt: comment.createdAt ?? new Date().toISOString(),
    isLiked:
      Boolean(comment.isLiked) ||
      hasUserLiked(comment.likedBy, currentUserId),
    likes: Math.max(0, Number(comment.likes) || 0),
    parentCommentId: comment.parentCommentId ?? null,
    postId: comment.postId ?? "",
    repliesCount: Math.max(0, Number(comment.repliesCount) || 0),
    updatedAt: comment.updatedAt ?? null,
    user: normalizeAuthor(comment),
  };
}

function normalizeCommentPagination(
  pagination?: ApiPagination,
): CommentPagination {
  return {
    currentPage: Math.max(1, Number(pagination?.currentPage) || 1),
    hasMore: Boolean(pagination?.hasMore),
    totalComments: Math.max(0, Number(pagination?.totalComments) || 0),
    totalPages: Math.max(0, Number(pagination?.totalPages) || 0),
  };
}

function normalizeReplyPagination(
  pagination?: ApiPagination,
): ReplyPagination {
  return {
    currentPage: Math.max(1, Number(pagination?.currentPage) || 1),
    hasMore: Boolean(pagination?.hasMore),
    totalPages: Math.max(0, Number(pagination?.totalPages) || 0),
    totalReplies: Math.max(0, Number(pagination?.totalReplies) || 0),
  };
}

async function requestApi<T>(
  path: string,
  init?: RequestInit,
  requireAuthentication = false,
): Promise<{ data?: T; error?: string }> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return { error: "Chưa cấu hình địa chỉ API." };
  }

  const accessToken = (await cookies()).get("accessToken")?.value;

  if (requireAuthentication && !accessToken) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  const headers = new Headers(init?.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers,
    });
    const payload = (await response.json().catch(() => null)) as
      | ApiEnvelope<T>
      | null;

    if (!response.ok || payload?.success === false) {
      return {
        error:
          payload?.message ??
          "Không thể hoàn tất yêu cầu. Vui lòng thử lại.",
      };
    }

    if (!payload || !("data" in payload)) {
      return { error: "Máy chủ trả về dữ liệu không hợp lệ." };
    }

    return { data: payload.data };
  } catch {
    return {
      error: "Không thể kết nối tới máy chủ. Vui lòng thử lại.",
    };
  }
}

function validateContent(content: string) {
  const normalized = cleanContent(content);

  if (!normalized) {
    return { error: "Nội dung bình luận không được để trống." };
  }

  if (normalized.length > 2200) {
    return { error: "Bình luận không được dài quá 2.200 ký tự." };
  }

  return { content: normalized };
}

export async function getPostComments(
  postId: string,
  offset = 0,
  limit = 20,
  currentUserId?: string,
): Promise<CommentListResult> {
  const normalizedPostId = cleanId(postId);
  if (!normalizedPostId) {
    return {
      comments: [],
      error: "Không tìm thấy bài viết.",
      pagination: emptyCommentPagination,
    };
  }

  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const result = await requestApi<{
    comments?: ApiComment[];
    pagination?: ApiPagination;
  }>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments?limit=${safeLimit}&offset=${safeOffset}`,
  );

  if (result.error) {
    return {
      comments: [],
      error: result.error,
      pagination: emptyCommentPagination,
    };
  }

  return {
    comments: (result.data?.comments ?? [])
      .map((comment) => normalizeComment(comment, currentUserId))
      .filter((comment) => Boolean(comment._id)),
    pagination: normalizeCommentPagination(result.data?.pagination),
  };
}

export async function createComment(
  postId: string,
  content: string,
  currentUserId?: string,
): Promise<CommentMutationResult> {
  const normalizedPostId = cleanId(postId);
  const validated = validateContent(content);

  if (!normalizedPostId) {
    return { success: false, error: "Không tìm thấy bài viết." };
  }
  if (validated.error || !validated.content) {
    return { success: false, error: validated.error };
  }

  const result = await requestApi<ApiComment>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: validated.content,
        parentCommentId: null,
      }),
    },
    true,
  );

  if (result.error || !result.data) {
    return {
      success: false,
      error: result.error ?? "Không thể đăng bình luận.",
    };
  }

  return {
    success: true,
    comment: normalizeComment(result.data, currentUserId),
  };
}

export async function getCommentReplies(
  postId: string,
  commentId: string,
  offset = 0,
  limit = 10,
  currentUserId?: string,
): Promise<ReplyListResult> {
  const normalizedPostId = cleanId(postId);
  const normalizedCommentId = cleanId(commentId);

  if (!normalizedPostId || !normalizedCommentId) {
    return {
      error: "Không tìm thấy bình luận.",
      pagination: emptyReplyPagination,
      replies: [],
    };
  }

  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const result = await requestApi<{
    pagination?: ApiPagination;
    replies?: ApiComment[];
  }>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments/${encodeURIComponent(normalizedCommentId)}/replies?limit=${safeLimit}&offset=${safeOffset}`,
  );

  if (result.error) {
    return {
      error: result.error,
      pagination: emptyReplyPagination,
      replies: [],
    };
  }

  return {
    pagination: normalizeReplyPagination(result.data?.pagination),
    replies: (result.data?.replies ?? [])
      .map((reply) => normalizeComment(reply, currentUserId))
      .filter((reply) => Boolean(reply._id)),
  };
}

export async function createCommentReply(
  postId: string,
  commentId: string,
  content: string,
  currentUserId?: string,
): Promise<CommentMutationResult> {
  const normalizedPostId = cleanId(postId);
  const normalizedCommentId = cleanId(commentId);
  const validated = validateContent(content);

  if (!normalizedPostId || !normalizedCommentId) {
    return { success: false, error: "Không tìm thấy bình luận." };
  }
  if (validated.error || !validated.content) {
    return { success: false, error: validated.error };
  }

  const result = await requestApi<ApiComment>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments/${encodeURIComponent(normalizedCommentId)}/replies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: validated.content }),
    },
    true,
  );

  if (result.error || !result.data) {
    return {
      success: false,
      error: result.error ?? "Không thể đăng câu trả lời.",
    };
  }

  return {
    success: true,
    comment: normalizeComment(result.data, currentUserId),
  };
}

export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
): Promise<CommentUpdateResult> {
  const normalizedPostId = cleanId(postId);
  const normalizedCommentId = cleanId(commentId);
  const validated = validateContent(content);

  if (!normalizedPostId || !normalizedCommentId) {
    return { success: false, error: "Không tìm thấy bình luận." };
  }
  if (validated.error || !validated.content) {
    return { success: false, error: validated.error };
  }

  const result = await requestApi<{
    _id?: string;
    content?: string;
    updatedAt?: string | null;
  }>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments/${encodeURIComponent(normalizedCommentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: validated.content }),
    },
    true,
  );

  if (result.error || !result.data) {
    return {
      success: false,
      error: result.error ?? "Không thể cập nhật bình luận.",
    };
  }

  return {
    success: true,
    comment: {
      _id: result.data._id ?? normalizedCommentId,
      content: result.data.content ?? validated.content,
      updatedAt: result.data.updatedAt ?? new Date().toISOString(),
    },
  };
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<CommentDeleteResult> {
  const normalizedPostId = cleanId(postId);
  const normalizedCommentId = cleanId(commentId);

  if (!normalizedPostId || !normalizedCommentId) {
    return { success: false, error: "Không tìm thấy bình luận." };
  }

  const result = await requestApi<null>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments/${encodeURIComponent(normalizedCommentId)}`,
    { method: "DELETE" },
    true,
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

async function setCommentLike(
  postId: string,
  commentId: string,
  method: "DELETE" | "POST",
): Promise<CommentLikeResult> {
  const normalizedPostId = cleanId(postId);
  const normalizedCommentId = cleanId(commentId);

  if (!normalizedPostId || !normalizedCommentId) {
    return { success: false, error: "Không tìm thấy bình luận." };
  }

  const result = await requestApi<{ likes?: number }>(
    `/api/posts/${encodeURIComponent(normalizedPostId)}/comments/${encodeURIComponent(normalizedCommentId)}/like`,
    { method },
    true,
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    likes:
      typeof result.data?.likes === "number"
        ? Math.max(0, result.data.likes)
        : undefined,
  };
}

export async function likeComment(
  postId: string,
  commentId: string,
): Promise<CommentLikeResult> {
  return setCommentLike(postId, commentId, "POST");
}

export async function unlikeComment(
  postId: string,
  commentId: string,
): Promise<CommentLikeResult> {
  return setCommentLike(postId, commentId, "DELETE");
}
