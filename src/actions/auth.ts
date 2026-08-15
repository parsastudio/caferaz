"use server";

export {
  loginAdminAction,
  logoutAdminAction,
  checkAdminAuth,
  updateAdminPasswordAction,
} from "@/actions/admin-auth";

export {
  sendUserOtpAction,
  loginUserWithOtpAction,
  registerUserAction,
  checkPhoneRegisteredAction,
  getCurrentUserAction,
  logoutUserAction,
} from "@/actions/user-auth";
