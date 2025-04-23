import { io } from "socket.io-client";
import { API_URL, SOCKET_CONFIG } from "./config";

let socket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

export const initSocket = (token) => {
  if (socket && socket.connected) {
    console.log("Socket already connected, reusing existing connection");
    return socket;
  }

  // Clean up any existing connection
  if (socket) {
    console.log("Cleaning up previous socket connection...");
    socket.disconnect();
    socket = null;
  }

  // Clear any pending reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Reset reconnect attempts
  reconnectAttempts = 0;

  // Validate token
  if (!token) {
    console.error("Socket connection token not provided");
    return null;
  }

  console.log("Initializing socket connection with token");
  try {
    socket = io(API_URL, {
      auth: { token },
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: SOCKET_CONFIG.reconnectionAttempts,
      reconnectionDelay: SOCKET_CONFIG.reconnectionDelay,
      timeout: SOCKET_CONFIG.timeout,
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully");
      reconnectAttempts = 0;
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      handleReconnect();
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);

      // If disconnected due to server issues, try to reconnect
      if (reason === "io server disconnect" || reason === "transport close") {
        handleReconnect();
      }
    });

    return socket;
  } catch (error) {
    console.error("Error initializing socket:", error.message);
    return null;
  }
};

// Helper function to handle reconnection logic
const handleReconnect = () => {
  if (
    reconnectAttempts < SOCKET_CONFIG.reconnectionAttempts &&
    !reconnectTimer
  ) {
    reconnectAttempts++;
    console.log(
      `Reconnect attempt ${reconnectAttempts}/${SOCKET_CONFIG.reconnectionAttempts}`
    );

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (socket) {
        console.log("Attempting to reconnect...");
        socket.connect();
      }
    }, SOCKET_CONFIG.reconnectionDelay);
  }
};

export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized. Call initSocket first.");
    return null;
  }
  return socket;
};

export const isSocketConnected = () => {
  return socket ? socket.connected : false;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket connection closed");
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  reconnectAttempts = 0;
};

export const emitEvent = (eventName, data) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit(eventName, data);
    return true;
  }
  console.warn("Failed to emit event: Socket not connected");
  return false;
};

export const onEvent = (eventName, callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on(eventName, callback);
    return true;
  }
  console.warn("Failed to register event listener: Socket not initialized");
  return false;
};

export const offEvent = (eventName, callback) => {
  const socket = getSocket();
  if (socket) {
    socket.off(eventName, callback);
    return true;
  }
  console.warn("Failed to remove event listener: Socket not initialized");
  return false;
};

// Setupo notification handler
export const setupNotificationHandler = (callback) => {
  if (socket) {
    try {
      // Remove any existing handlers to prevent duplicates
      socket.off("notification");

      // Add the new handler
      socket.on("notification", (data) => {
        console.log("Bildirim alındı:", data);

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
        callback(data);
      });

      console.log("Bildirim işleyicisi başarıyla kuruldu");

      // Log if notification handler is active
      if (socket.hasListeners && socket.hasListeners("notification")) {
        console.log("Bildirim dinleyicisi aktif");
      } else {
        console.warn("Bildirim dinleyicisi aktif değil!");
      }

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
    try {
      socket.off("notification");
      console.log("Bildirim işleyicisi kaldırıldı");
      return true;
    } catch (error) {
      console.error("Bildirim işleyicisi kaldırılırken hata oluştu:", error);
      return false;
    }
  }
  return false;
};
