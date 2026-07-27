"use server";

import { revalidatePath } from "next/cache";
import { apiRequest, resolveApiAssetUrl } from "./api-client";

export type FeedUser = {
  _id: string;
  bio?: string | null;
  followersCount?: number;
  followingCount?: number;
  fullName?: string | null;
  isFollowing?: boolean;
  postsCount?: number;
  profilePicture?: string | null;
  username: string;
};

export type FeedPost = {
  _id: string;
  caption?: string | null;
  comments: number;
  createdAt: string;
  engagementScore?: number;
  image?: string | null;
  isLiked: boolean;
  isSaved: boolean;
  likes: number;
  mediaType: "image" | "video";
  updatedAt?: string;
  user: FeedUser;
  userId?: string;
  video?: string | null;
};

type FeedPostApi = {
  _id: string;
  caption?: string | null;
  comments?: number | unknown[];
  createdAt?: string;
  engagementScore?: number;
  image?: string | null;
  isLiked?: boolean;
  isSaved?: boolean;
  likedBy?: unknown[];
  likes?: number | unknown[];
  mediaType?: "image" | "video";
  savedBy?: unknown[];
  updatedAt?: string;
  user?: FeedUser;
  userId?: FeedUser | string;
  video?: string | null;
};

export type FeedPagination = {
  currentPage: number;
  hasMore: boolean;
  totalPages: number;
  totalPosts: number;
};

export type NewsFeedResult = {
  error?: string;
  pagination: FeedPagination;
  posts: FeedPost[];
};

export type PostFilter = "all" | "saved" | "video";

export type PostStats = {
  totalComments: number;
  totalImages: number;
  totalLikes: number;
  totalPosts: number;
  totalVideos: number;
};

export type PostMutationResult = {
  data?: Partial<FeedPost> | null;
  message: string;
  success: boolean;
};

export type PostFormState = {
  message: string;
  post?: FeedPost;
  success: boolean;
};

type PostListApiResponse = {
  pagination?: Partial<FeedPagination>;
  posts?: FeedPostApi[];
};

type PaginationContext = {
  limit: number;
  offset: number;
  receivedCount: number;
};

const emptyPagination: FeedPagination = {
  currentPage: 1,
  hasMore: false,
  totalPages: 0,
  totalPosts: 0,
};

function normalizeCount(value: number | unknown[] | undefined) {
  if (Array.isArray(value)) {
    return value.length;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function fallbackUser(userId?: string): FeedUser {
  const shortId = userId?.slice(-6) || "instagram";

  return {
    _id: userId ?? "unknown",
    fullName: "Người dùng Instagram",
    username: `user_${shortId}`,
  };
}

function normalizeUser(user: FeedUser): FeedUser {
  return {
    ...user,
    profilePicture: resolveApiAssetUrl(user.profilePicture),
  };
}

function normalizePagination(
  pagination?: Partial<FeedPagination>,
  context?: PaginationContext,
): FeedPagination {
  const totalPosts = pagination?.totalPosts ?? 0;
  const inferredCurrentPage = context
    ? Math.floor(context.offset / context.limit) + 1
    : 1;
  const inferredHasMore = context
    ? totalPosts > context.offset + context.receivedCount ||
      (totalPosts === 0 &&
        context.receivedCount > 0 &&
        context.receivedCount === context.limit)
    : false;

  return {
    currentPage: pagination?.currentPage ?? inferredCurrentPage,
    hasMore: pagination?.hasMore ?? inferredHasMore,
    totalPages: pagination?.totalPages ?? 0,
    totalPosts,
  };
}

async function getUsersForPosts(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  const users = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const result = await apiRequest<FeedUser>(
        `/api/users/${encodeURIComponent(userId)}`,
        {},
        { auth: "optional" },
      );

      return result.success ? result.data : null;
    }),
  );

  return new Map(
    users
      .filter((user): user is FeedUser => Boolean(user?._id))
      .map((user) => [user._id, user]),
  );
}

async function normalizePosts(
  rawPosts: FeedPostApi[],
  suppliedOwner?: FeedUser,
) {
  const unresolvedUserIds = rawPosts.flatMap((post) =>
    typeof post.userId === "string" && post.userId !== suppliedOwner?._id
      ? [post.userId]
      : [],
  );
  const usersById = await getUsersForPosts(unresolvedUserIds);

  return rawPosts.map((post): FeedPost => {
    const embeddedUser =
      post.user ??
      (typeof post.userId === "object" && post.userId
        ? post.userId
        : undefined);
    const userId =
      typeof post.userId === "string"
        ? post.userId
        : embeddedUser?._id ?? suppliedOwner?._id;
    const rawUser =
      embeddedUser ??
      (userId === suppliedOwner?._id ? suppliedOwner : undefined) ??
      usersById.get(userId ?? "") ??
      fallbackUser(userId);
    const user = normalizeUser(rawUser);

    return {
      _id: post._id,
      caption: post.caption ?? null,
      comments: normalizeCount(post.comments),
      createdAt: post.createdAt ?? new Date(0).toISOString(),
      engagementScore: post.engagementScore,
      image: resolveApiAssetUrl(post.image),
      isLiked: Boolean(post.isLiked),
      isSaved: Boolean(post.isSaved),
      likes: normalizeCount(post.likes ?? post.likedBy),
      mediaType: post.mediaType === "video" ? "video" : "image",
      updatedAt: post.updatedAt,
      user,
      userId,
      video: resolveApiAssetUrl(post.video),
    };
  });
}

async function getPostList(
  path: string,
  options: {
    auth?: boolean | "optional";
    owner?: FeedUser;
    pagination?: Omit<PaginationContext, "receivedCount">;
  } = {},
): Promise<NewsFeedResult> {
  const result = await apiRequest<PostListApiResponse>(
    path,
    {},
    { auth: options.auth ?? "optional" },
  );

  if (!result.success) {
    return {
      error: result.message,
      pagination: emptyPagination,
      posts: [],
    };
  }

  const rawPosts = result.data?.posts ?? [];
  const paginationContext = options.pagination
    ? {
        ...options.pagination,
        receivedCount: rawPosts.length,
      }
    : undefined;

  return {
    pagination: normalizePagination(
      result.data?.pagination,
      paginationContext,
    ),
    posts: await normalizePosts(rawPosts, options.owner),
  };
}

export async function getNewsFeed(
  offset = 0,
  limit = 6,
): Promise<NewsFeedResult> {
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(20, Math.max(1, Math.floor(limit)));

  return getPostList(
    `/api/posts/feed?limit=${safeLimit}&offset=${safeOffset}`,
    {
      pagination: { limit: safeLimit, offset: safeOffset },
    },
  );
}

export async function getExplorePosts(
  page = 1,
  limit = 18,
): Promise<NewsFeedResult> {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(30, Math.max(1, Math.floor(limit)));

  return getPostList(
    `/api/posts/explore?page=${safePage}&limit=${safeLimit}`,
    {
      pagination: {
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
      },
    },
  );
}

export async function getUserPosts(
  userId: string,
  filter: PostFilter = "all",
  offset = 0,
  limit = 18,
): Promise<NewsFeedResult> {
  const normalizedUserId = userId.trim();
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(30, Math.max(1, Math.floor(limit)));

  if (!normalizedUserId) {
    return {
      error: "Không tìm thấy người dùng.",
      pagination: emptyPagination,
      posts: [],
    };
  }

  const ownerResult = await apiRequest<FeedUser>(
    `/api/users/${encodeURIComponent(normalizedUserId)}`,
    {},
    { auth: "optional" },
  );

  return getPostList(
    `/api/posts/user/${encodeURIComponent(normalizedUserId)}?filter=${filter}&limit=${safeLimit}&offset=${safeOffset}`,
    {
      auth: filter === "saved" ? true : "optional",
      owner: ownerResult.success ? ownerResult.data : undefined,
      pagination: { limit: safeLimit, offset: safeOffset },
    },
  );
}

export async function getUserPostStats(
  userId: string,
): Promise<{ error?: string; stats?: PostStats }> {
  const result = await apiRequest<PostStats>(
    `/api/posts/user/${encodeURIComponent(userId)}/stats`,
    {},
    { auth: "optional" },
  );

  return result.success
    ? { stats: result.data }
    : { error: result.message };
}

export async function getPostById(
  postId: string,
): Promise<{ error?: string; post?: FeedPost }> {
  const result = await apiRequest<FeedPostApi>(
    `/api/posts/${encodeURIComponent(postId)}`,
    {},
    { auth: "optional" },
  );

  if (!result.success) {
    return { error: result.message };
  }

  const [post] = await normalizePosts([result.data]);
  return post ? { post } : { error: "Không tìm thấy bài viết." };
}

export async function createPostAction(
  _previousState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return {
      message: "Vui lòng chọn một ảnh hoặc video.",
      success: false,
    };
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return {
      message: "Định dạng tệp không được hỗ trợ.",
      success: false,
    };
  }

  if (file.size > 50 * 1024 * 1024) {
    return {
      message: "Tệp tải lên không được vượt quá 50MB.",
      success: false,
    };
  }

  if (caption.length > 2200) {
    return {
      message: "Chú thích không được vượt quá 2.200 ký tự.",
      success: false,
    };
  }

  const payload = new FormData();
  payload.set("file", file);
  if (caption) {
    payload.set("caption", caption);
  }

  const result = await apiRequest<FeedPostApi>(
    "/api/posts",
    {
      body: payload,
      method: "POST",
    },
    { auth: true },
  );

  if (!result.success) {
    return { message: result.message, success: false };
  }

  const [post] = await normalizePosts([result.data]);
  revalidatePath("/");

  return {
    message: result.message || "Đã đăng bài viết.",
    post,
    success: true,
  };
}

export async function updatePostAction(
  postId: string,
  caption: string,
): Promise<PostMutationResult> {
  const normalizedCaption = caption.trim();

  if (normalizedCaption.length > 2200) {
    return {
      message: "Chú thích không được vượt quá 2.200 ký tự.",
      success: false,
    };
  }

  const result = await apiRequest<Partial<FeedPost>>(
    `/api/posts/${encodeURIComponent(postId)}`,
    {
      body: JSON.stringify({ caption: normalizedCaption }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    },
    { auth: true },
  );

  if (!result.success) {
    return { message: result.message, success: false };
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  return { data: result.data, message: result.message, success: true };
}

export async function deletePostAction(
  postId: string,
): Promise<PostMutationResult> {
  const result = await apiRequest<null>(
    `/api/posts/${encodeURIComponent(postId)}`,
    { method: "DELETE" },
    { auth: true },
  );

  if (!result.success) {
    return { message: result.message, success: false };
  }

  revalidatePath("/");
  return { data: null, message: result.message, success: true };
}

export async function setPostLikeAction(
  postId: string,
  shouldLike: boolean,
): Promise<PostMutationResult> {
  const result = await apiRequest<Partial<FeedPost>>(
    `/api/posts/${encodeURIComponent(postId)}/like`,
    { method: shouldLike ? "POST" : "DELETE" },
    { auth: true },
  );

  return result.success
    ? { data: result.data, message: result.message, success: true }
    : { message: result.message, success: false };
}

export async function setPostSaveAction(
  postId: string,
  shouldSave: boolean,
): Promise<PostMutationResult> {
  const result = await apiRequest<null>(
    `/api/posts/${encodeURIComponent(postId)}/save`,
    { method: shouldSave ? "POST" : "DELETE" },
    { auth: true },
  );

  return result.success
    ? { data: null, message: result.message, success: true }
    : { message: result.message, success: false };
}
