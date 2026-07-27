"use client";

import type { PostComment } from "@/app/services/comment.action";
import { useState } from "react";
import CommentReplies from "./CommentReplies";
import CommentRow from "./CommentRow";

type CommentThreadProps = {
  comment: PostComment;
  currentUserId?: string;
  onChange: (comment: PostComment) => void;
  onCountDelta: (delta: number) => void;
  onDelete: (comment: PostComment) => void;
  postId: string;
};

export default function CommentThread({
  comment,
  currentUserId,
  onChange,
  onCountDelta,
  onDelete,
  postId,
}: CommentThreadProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);

  function handleReply() {
    setRepliesVisible(true);
    setComposerOpen(true);
  }

  return (
    <div>
      <CommentRow
        comment={comment}
        currentUserId={currentUserId}
        onChange={onChange}
        onDelete={onDelete}
        onReply={handleReply}
        postId={postId}
      />
      <div className="ml-12">
        <CommentReplies
          composerOpen={composerOpen}
          currentUserId={currentUserId}
          onComposerOpenChange={setComposerOpen}
          onCountDelta={onCountDelta}
          onParentChange={onChange}
          onVisibleChange={setRepliesVisible}
          parentComment={comment}
          postId={postId}
          visible={repliesVisible}
        />
      </div>
    </div>
  );
}
