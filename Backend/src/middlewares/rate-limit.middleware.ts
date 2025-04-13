import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: {
    error:
      "Çok fazla giriş denemesi yaptınız, lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per IP
  message: {
    error:
      "Kullanıcı isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Movie routes rate limiter - higher limits for browsing
export const movieLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per IP
  message: {
    error: "Film isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Actor routes rate limiter
export const actorLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per IP
  message: {
    error:
      "Oyuncu isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Genre routes rate limiter
export const genreLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per IP
  message: {
    error: "Tür isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Review routes rate limiter
export const reviewLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 15, // 15 requests per IP
  message: {
    error:
      "İnceleme isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rating routes rate limiter
export const ratingLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 20, // 20 requests per IP
  message: {
    error:
      "Derecelendirme isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Watchlist/Wishlist rate limiter
export const listLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 25, // 25 requests per IP
  message: {
    error: "Liste isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Library routes rate limiter
export const libraryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 25, // 25 requests per IP
  message: {
    error:
      "Kütüphane isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Friendship routes rate limiter
export const friendshipLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per IP
  message: {
    error:
      "Arkadaşlık isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Notification routes rate limiter
export const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 40, // 40 requests per IP
  message: {
    error:
      "Bildirim isteklerinde limit aşıldı, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const defaultLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: "Çok fazla istek yaptınız, lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
