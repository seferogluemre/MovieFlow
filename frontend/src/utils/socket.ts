import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;
let notificationCallbacks: Array<(data: any) => void> = [];
let socketEventsRegistered = false;

export const initSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  reconnectAttempts = 0;
  socketEventsRegistered = false;

  if (!token) {
    console.error("Socket bağlantısı için token sağlanmadı!");
    return null;
  }

  console.log("Socket.io bağlantısı başlatılıyor...");

  socket = io("http://localhost:3000", {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ["websocket"],
  });

  registerSocketEvents();

  return socket;
};

const registerSocketEvents = () => {
  if (!socket || socketEventsRegistered) return;

  console.log("Socket olayları kaydediliyor...");
  socketEventsRegistered = true;

  socket.on("connect", () => {
    console.log("Socket.io bağlantısı başarılı");
    reconnectAttempts = 0;
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

      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          if (socket) {
            console.log("Yeniden bağlanılıyor...");
            socket.connect();
          }
        }, 3000);
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.io bağlantısı kesildi:", reason);
    socketEventsRegistered = false;

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

  // Handle notification events with improved logging
  socket.on("notification", (data) => {
    console.log(
      "%c Socket.io üzerinden bildirim alındı:",
      "background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;",
      data
    );

    // Özel bir event dispatcher oluştur
    const dispatchNotificationEvent = () => {
      // Tüm kayıtlı callback'leri çağır
      if (notificationCallbacks.length === 0) {
        console.warn("Bildirim alındı fakat hiç callback kayıtlı değil!");
      }

      notificationCallbacks.forEach((callback, index) => {
        try {
          console.log(`Callback #${index + 1} çağrılıyor...`);
          callback(data);
        } catch (error) {
          console.error(`Callback #${index + 1} çalıştırılırken hata:`, error);
        }
      });
    };

    // Bildirim için özel dispatcher oluştur ve hemen çalıştır
    dispatchNotificationEvent();

    // DOM event olarak da bildirim gönder (global yakalama için)
    try {
      const notificationEvent = new CustomEvent("socketNotification", {
        detail: data,
      });
      window.dispatchEvent(notificationEvent);
    } catch (error) {
      console.error("CustomEvent oluşturulurken hata:", error);
    }
  });
};

// Get existing socket
export const getSocket = () => {
  return socket;
};

// Check if socket is connected
export const isSocketConnected = () => {
  if (socket && !socketEventsRegistered) {
    registerSocketEvents();
  }
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
  notificationCallbacks = [];
  socketEventsRegistered = false;
};

// Setup notification handler
export const setupNotificationHandler = (callback: (data: any) => void) => {
  if (!socket) {
    console.error("Socket bağlantısı yok, bildirim dinleyicisi eklenemiyor");
    return false;
  }

  try {
    if (!socketEventsRegistered) {
      registerSocketEvents();
    }

    const isCallbackAlreadyRegistered =
      notificationCallbacks.includes(callback);
    if (!isCallbackAlreadyRegistered) {
      notificationCallbacks.push(callback);
      console.log(
        `Bildirim callback'i eklendi. Toplam: ${notificationCallbacks.length}`
      );
    } else {
      console.log("Bu callback zaten kayıtlı, tekrar eklenmedi");
    }

    socket.off("notification").on("notification", (data) => {
      console.log("Socket.io üzerinden bildirim alındı:", data);

      if (!data || typeof data !== "object") {
        console.error("Geçersiz bildirim verisi:", data);
        return;
      }

      if (!data.type || !data.message) {
        console.error("Eksik bildirim alanları:", data);
        return;
      }

      console.log("Bildirim callback'i doğrudan çağrılıyor...");
      callback(data);
    });

    console.log("Bildirim işleyicisi başarıyla kuruldu ve aktif");

    if (socket.hasListeners && socket.hasListeners("notification")) {
      console.log("Bildirim dinleyicisi başarıyla bağlandı ve aktif");
    } else {
      console.warn("Bildirim dinleyicisi eklenemedi veya aktif değil!");

      socket.on("notification", (data) => {
        console.log("Yedek bildirim handler'ı çalıştı:", data);
        callback(data);
      });
    }

    return true;
  } catch (error) {
    console.error("Bildirim işleyicisi kurulurken hata oluştu:", error);
    return false;
  }
};

export const removeNotificationHandler = () => {
  if (socket) {
    socket.off("notification");
    console.log("Bildirim işleyicisi kaldırıldı");
  }
  notificationCallbacks = [];
};

export const hasNotificationHandler = () => {
  return notificationCallbacks.length > 0;
};
