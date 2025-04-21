import { z } from "zod";

/**
 * E-posta gönderme isteği için validasyon şeması
 * Sadece e-posta adresi gereklidir ve geçerli bir formatta olmalıdır
 */
export const sendVerificationEmailSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi boş olamaz")
    .email("Geçerli bir e-posta adresi giriniz")
    .trim(),
});

/**
 * E-posta doğrulama isteği için validasyon şeması
 * E-posta adresi ve 6 haneli doğrulama kodu gereklidir
 */
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi boş olamaz")
    .email("Geçerli bir e-posta adresi giriniz")
    .trim(),
  code: z
    .string()
    .length(6, "Doğrulama kodu 6 karakter olmalıdır")
    .regex(/^\d{6}$/, "Doğrulama kodu sadece rakamlardan oluşmalıdır"),
});

// TypeScript type tanımlamaları
export type SendVerificationEmailType = z.infer<
  typeof sendVerificationEmailSchema
>;
export type VerifyEmailType = z.infer<typeof verifyEmailSchema>;
