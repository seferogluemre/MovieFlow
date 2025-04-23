export const API_URL = "http://localhost:3000";

// Socket.io connection parameters
export const SOCKET_CONFIG = {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
};

// General application configuration
export const APP_CONFIG = {
  apiTimeout: 30000, // Default timeout for API calls
  defaultImageUrl: "/placeholder.jpg",
  maxUploadSize: 5 * 1024 * 1024, // 5MB
};
