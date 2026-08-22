import { Comment } from "@/types";

interface PrismaCommentDb {
  id: string;
  productId: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  rating: number | null;
  commentText: string;
  createdAt: Date;
  status: string;
  parentCommentId: string | null;
}

export function buildCommentTree(comments: PrismaCommentDb[]): Comment[] {
  const commentMap = new Map<
    string,
    Comment & { parentCommentId: string | null }
  >();

  comments.forEach((c) => {
    commentMap.set(c.id, {
      id: c.id,
      productId: c.productId ?? undefined,
      firstName: c.firstName ?? "",
      rating: c.rating,
      commentText: c.commentText,
      createdAt: c.createdAt.toISOString(),
      status: c.status as Comment["status"],
      replies: [],
      parentCommentId: c.parentCommentId,
    });
  });

  const rootComments: Comment[] = [];

  comments.forEach((c) => {
    const mapped = commentMap.get(c.id);
    if (mapped) {
      if (c.parentCommentId && commentMap.has(c.parentCommentId)) {
        const parent = commentMap.get(c.parentCommentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(mapped);
        }
      } else {
        rootComments.push(mapped);
      }
    }
  });

  const sortReplies = (comment: Comment) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      comment.replies.forEach(sortReplies);
    }
  };
  rootComments.forEach(sortReplies);

  return rootComments;
}

export function insertCommentReply<T extends { id: string; replies?: T[] }>(
  tree: T[],
  parentId: string,
  reply: T,
): T[] {
  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        replies: [...(node.replies || []), reply],
      };
    }
    if (node.replies && node.replies.length > 0) {
      return {
        ...node,
        replies: insertCommentReply(node.replies, parentId, reply),
      };
    }
    return node;
  });
}

export function updateCommentInTree<T extends { id: string; replies?: T[] }>(
  tree: T[],
  id: string,
  updater: (node: T) => T,
): T[] {
  return tree.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.replies && node.replies.length > 0) {
      return {
        ...node,
        replies: updateCommentInTree(node.replies, id, updater),
      };
    }
    return node;
  });
}

export function removeCommentFromTree<T extends { id: string; replies?: T[] }>(
  tree: T[],
  id: string,
): T[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.replies && node.replies.length > 0) {
        return {
          ...node,
          replies: removeCommentFromTree(node.replies, id),
        };
      }
      return node;
    });
}
