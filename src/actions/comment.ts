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
