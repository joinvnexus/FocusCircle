import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommentThread } from "@/components/forms/comment-thread";
import * as commentActions from "@/app/actions/comments";
import type { CircleWorkspaceSnapshot } from "@/types";

vi.mock("@/app/actions/comments", () => ({
  createCommentAction: vi.fn(),
  toggleCommentReactionAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

type WorkspaceComment = CircleWorkspaceSnapshot["comments"][number];

function makeComment(overrides: Partial<WorkspaceComment> & { id: string }): WorkspaceComment {
  return {
    body: "Comment",
    target_type: "task",
    target_id: "task-1",
    parent_id: null,
    user_id: "user-1",
    mentions: [],
    reactions: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    users: { full_name: "Alice", avatar_url: null, email: "alice@example.com" },
    ...overrides,
  } as WorkspaceComment;
}

describe("CommentThread", () => {
  it("highlights @mention tokens in the comment body", () => {
    const comments = [makeComment({ id: "c1", body: "Hey @Sam can you check this?" })];
    render(<CommentThread comments={comments} targetId="task-1" targetType="task" />);

    const mentionSpan = screen.getByText("@Sam");
    expect(mentionSpan).toBeInTheDocument();
    expect(mentionSpan.className).toContain("text-primary");
  });

  it("renders nested replies at any depth", () => {
    const comments = [
      makeComment({ id: "root", body: "Root comment", parent_id: null }),
      makeComment({ id: "reply-1", body: "First reply", parent_id: "root" }),
      makeComment({ id: "reply-2", body: "Nested reply", parent_id: "reply-1" }),
    ];

    render(<CommentThread comments={comments} targetId="task-1" targetType="task" />);

    expect(screen.getByText("Root comment")).toBeInTheDocument();
    expect(screen.getByText("First reply")).toBeInTheDocument();
    expect(screen.getByText("Nested reply")).toBeInTheDocument();
  });

  it("toggles a reaction on a comment", async () => {
    const toggleCommentReactionAction = vi.mocked(commentActions.toggleCommentReactionAction);
    toggleCommentReactionAction.mockResolvedValue({ error: null });

    const comments = [makeComment({ id: "c1", body: "Nice work", reactions: { "👍": ["someone-else"] } })];
    render(<CommentThread comments={comments} targetId="task-1" targetType="task" />);

    await userEvent.click(screen.getByRole("button", { name: /👍 1/ }));

    expect(toggleCommentReactionAction).toHaveBeenCalledWith("c1", "👍");
  });

  it("shows an empty state when there are no comments", () => {
    render(<CommentThread comments={[]} targetId="task-1" targetType="task" />);
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });
});
