"use server";

export {
  getCommentsAction,
  submitCommentAction,
} from "@/actions/public-comment";

export {
  getAdminCommentsAction,
  approveCommentAction,
  rejectCommentAction,
  spamCommentAction,
  editCommentAction,
  deleteCommentAction,
} from "@/actions/admin-comment";

export { buildCommentTree, type PrismaCommentDb } from "@/lib/comment-tree";
export type { ActionResponse } from "@/types/actions";
