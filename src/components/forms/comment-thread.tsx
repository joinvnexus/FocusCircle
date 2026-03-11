"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCommentAction, toggleCommentReactionAction } from "@/app/actions/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import type { CircleWorkspaceSnapshot, CommentTargetType } from "@/types";

type WorkspaceComment = CircleWorkspaceSnapshot["comments"][number];

export function CommentThread({
  comments,
  targetId,
  targetType,
}: {
  comments: WorkspaceComment[];
  targetId: string;
  targetType: CommentTargetType;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const rootComments = comments.filter((comment) => comment.parent_id === null);

  return (
    <div className="space-y-4">
      <CommentComposer targetId={targetId} targetType={targetType} />
      {rootComments.length ? rootComments.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          replies={comments.filter((reply) => reply.parent_id === comment.id)}
          onReply={() => setReplyTo((current) => (current === comment.id ? null : comment.id))}
          showReply={replyTo === comment.id}
          targetId={targetId}
          targetType={targetType}
        />
      )) : <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No comments yet.</div>}
    </div>
  );
}

function CommentNode({
  comment,
  replies,
  onReply,
  showReply,
  targetId,
  targetType,
}: {
  comment: WorkspaceComment;
  replies: WorkspaceComment[];
  onReply: () => void;
  showReply: boolean;
  targetId: string;
  targetType: CommentTargetType;
}) {
  return (
    <div className="space-y-3 rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          {comment.users?.avatar_url ? (
            <AvatarImage src={comment.users.avatar_url} alt={comment.users.full_name || "User avatar"} />
          ) : null}
          <AvatarFallback>{getInitials(comment.users?.full_name ?? "U")}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium">{comment.users?.full_name ?? "User"}</div>
            <div className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</div>
          </div>
          <p className="text-sm text-muted-foreground">{comment.body}</p>
          <div className="flex flex-wrap gap-2">
            {["👍", "🔥", "🎯"].map((emoji) => (
              <ReactionButton key={emoji} comment={comment} emoji={emoji} />
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={onReply}>Reply</Button>
          </div>
        </div>
      </div>
      {showReply && <CommentComposer targetId={targetId} targetType={targetType} parentId={comment.id} />}
      {replies.length > 0 && (
        <div className="ml-12 space-y-3 border-l pl-4">
          {replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} replies={[]} onReply={() => undefined} showReply={false} targetId={targetId} targetType={targetType} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentComposer({
  targetId,
  targetType,
  parentId,
}: {
  targetId: string;
  targetType: CommentTargetType;
  parentId?: string;
}) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a comment. Use @name for mentions." />
      <Button
        type="button"
        disabled={isPending || !body.trim()}
        onClick={() => {
          startTransition(async () => {
            const result = await createCommentAction({ targetType, targetId, body, parentId });
            if (result.error) {
              toast.error(result.error);
              return;
            }
            setBody("");
            toast.success("Comment posted");
          });
        }}
      >
        {isPending ? "Posting..." : "Post"}
      </Button>
    </div>
  );
}

function ReactionButton({ comment, emoji }: { comment: WorkspaceComment; emoji: string }) {
  const [isPending, startTransition] = useTransition();
  const count = comment.reactions?.[emoji]?.length ?? 0;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleCommentReactionAction(comment.id, emoji);
          if (result.error) {
            toast.error(result.error);
          }
        });
      }}
    >
      {emoji} {count}
    </Button>
  );
}
