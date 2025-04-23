import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

// Initialize socket connection
export const initSocket = (token: string) => {
  // Close existing socket if it exists
  if (socket) {
    console.log("Önceki socket bağlantısı kapatılıyor...");
    socket.disconnect();
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  reconnectAttempts = 0;

  // Validate token before attempting connection
  if (!token) {
    console.error("Socket bağlantısı için token sağlanmadı!");
    return null;
  }

  console.log("Socket.io bağlantısı başlatılıyor...");

  // Create new socket connection
  socket = io("http://localhost:3000", {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    timeout: 20000, // Bağlantı zaman aşımı
    transports: ["websocket"], // WebSocket protokolünü tercih et - daha hızlı
  });

  // Connection event handlers
  socket.on("connect", () => {
    console.log("Socket.io bağlantısı başarılı");
    reconnectAttempts = 0; // Reset reconnect attempts on successful connection
  });

  socket.on("connected", (data) => {
    console.log("Socket sunucudan bağlantı onayı alındı:", data);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.io bağlantı hatası:", error.message);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(
        `Yeniden bağlanma denemesi ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`
      );

      // Start reconnect timer if not already running
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          if (socket) {
            console.log("Yeniden bağlanılıyor...");
            socket.connect();
          }
        }, 3000); // 3 saniye sonra tekrar dene
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.io bağlantısı kesildi:", reason);

    // If disconnected due to io server disconnect or transport close, try to reconnect
    if (reason === "io server disconnect" || reason === "transport close") {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && socket) {
        reconnectAttempts++;
        console.log(
          `Yeniden bağlanma denemesi ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`
        );

        // Start reconnect timer if not already running
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            if (socket) {
              console.log("Yeniden bağlanılıyor...");
              socket.connect();
            }
          }, 3000); // 3 saniye sonra tekrar dene
        }
      }
    }
  });

  // Handle notification events
  socket.on("notification", (data) => {
    console.log("Socket.io üzerinden bildirim alındı:", data);
  });

  return socket;
};

// Get existing socket
export const getSocket = () => {
  return socket;
};

// Check if socket is connected
export const isSocketConnected = () => {
  return socket ? socket.connected : false;
};

// Close socket connection
export const closeSocket = () => {
  if (socket) {
    console.log("Socket.io bağlantısı kapatılıyor...");
    socket.disconnect();
    socket = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  reconnectAttempts = 0;
};

// Setup notification handler
export const setupNotificationHandler = (callback: (data: any) => void) => {
  if (socket) {
    try {
      // Remove any existing handlers to prevent duplicates
      socket.off("notification");

      // Add the new handler
      socket.on("notification", (data) => {
        console.log("Socket.io üzerinden bildirim alındı:", data);

        // Validate notification data
        if (!data || typeof data !== "object") {
          console.error("Geçersiz bildirim verisi:", data);
          return;
        }

        // Check required fields
        if (!data.type || !data.message) {
          console.error("Eksik bildirim alanları:", data);
          return;
        }

        // Call the callback with the notification data
        console.log("Bildirim callback'i çağrılıyor...");
        callback(data);
      });

      console.log("Bildirim işleyicisi başarıyla kuruldu ve aktif");

      return true;
    } catch (error) {
      console.error("Bildirim işleyicisi kurulurken hata oluştu:", error);
      return false;
    }
  }

  console.error("Bildirim işleyicisi kurulamadı: Socket bağlantısı yok");
  return false;
};

// Remove notification handler
export const removeNotificationHandler = () => {
  if (socket) {
    socket.off("notification");
    console.log("Bildirim işleyicisi kaldırıldı");
  }
};
