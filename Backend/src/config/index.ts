import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "my_super_secret_key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
  upload: {
    posterPath: process.env.UPLOAD_POSTER_PATH || "/posters",
    profilePath: process.env.UPLOAD_PROFILE_PATH || "/uploads",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
};
