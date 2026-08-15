"use server";

export {
  loginAdminAction,
  logoutAdminAction,
  checkAdminAuth,
  updateAdminPasswordAction,
} from "@/actions/admin-auth";

export {
  sendUserOtpAction,
  loginUserAction,
  loginUserWithOtpAction,
  registerUserAction,
  checkPhoneRegisteredAction,
  getCurrentUserAction,
  logoutUserAction,
} from "@/actions/user-auth";
