import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Email không hợp lệ."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginActionState = {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof LoginFormValues, string[]>>;
  values?: Partial<LoginFormValues>;
};

export const initialLoginState: LoginActionState = {
  success: false,
  message: "",
};

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Email không hợp lệ."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export type ForgotPasswordActionState = {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ForgotPasswordFormValues, string[]>>;
  values?: Partial<ForgotPasswordFormValues>;
};

export const initialForgotPasswordState: ForgotPasswordActionState = {
  success: false,
  message: "",
};

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới.")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác minh mật khẩu mới."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Mật khẩu xác minh không khớp.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export type ResetPasswordActionState = {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ResetPasswordFormValues, string[]>>;
};

export const initialResetPasswordState: ResetPasswordActionState = {
  success: false,
  message: "",
};

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới.")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine(
    ({ currentPassword, newPassword }) => currentPassword !== newPassword,
    {
      message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      path: ["newPassword"],
    },
  )
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "Mật khẩu xác nhận không khớp.",
      path: ["confirmPassword"],
    },
  );

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export type ChangePasswordActionState = {
  errors?: Partial<Record<keyof ChangePasswordFormValues, string[]>>;
  message: string;
  success: boolean;
};

export const initialChangePasswordState: ChangePasswordActionState = {
  message: "",
  success: false,
};

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập username."),
    fullName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ và tên."),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email.")
      .email("Email không hợp lệ."),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu.")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác minh mật khẩu."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Mật khẩu xác minh không khớp.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type RegisterActionState = {
  success: boolean;
  message: string;
};

export const initialRegisterState: RegisterActionState = {
  success: false,
  message: "",
};
