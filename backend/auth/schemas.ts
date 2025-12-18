import { z } from "zod";
import { emailSchema, passwordSchema, userRoleSchema } from "../shared/schemas";

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100),
  role: userRoleSchema,
});

export const registerResponseSchema = z.object({
  message: z.string(),
  userId: z.string(),
  email: z.string(),
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: userRoleSchema,
    isVerified: z.boolean(),
  }),
});

export const verifyRequestSchema = z.object({
  token: z.string().min(1),
});

export const verifyResponseSchema = z.object({
  message: z.string(),
});

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
});

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  isVerified: z.boolean(),
  createdAt: z.string(),
});

export const resendVerificationRequestSchema = z.object({
  emailOrPhone: z.string().min(1),
});

export const resendVerificationResponseSchema = z.object({
  message: z.string(),
});

export const logoutResponseSchema = z.object({
  message: z.string(),
});
