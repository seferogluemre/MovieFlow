import { Box, Tooltip, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getSocket } from "../utils/socket";

// Online/offline durumu gösteren yuvarlak nokta için styled component
const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isOnline", // isOnline prop'unu DOM'a geçirme (custom prop hatası önlemek için)
})<{ isOnline?: boolean }>(({ theme, isOnline }) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: isOnline ? "#4CAF50" : "#9e9e9e", // Yeşil veya gri
  display: "inline-block",
  marginRight: theme.spacing(1),
  boxShadow: isOnline ? "0 0 4px #4CAF50" : "none", // Online ise hafif parıltı efekti
}));

interface UserOnlineStatusProps {
  userId: number;
  withTooltip?: boolean;
  size?: "small" | "medium" | "large";
}

const UserOnlineStatus: React.FC<UserOnlineStatusProps> = ({
  userId,
  withTooltip = true,
  size = "medium",
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    // İlk render'da mevcut online kullanıcılar listesini kontrol et
    const socket = getSocket();
    if (!socket) {
      console.error("Socket bağlantısı mevcut değil");
      return;
    }

    // Online durumu sorgula
    socket.emit("get_online_users");

    // Online kullanıcılar listesini dinle
    const handleOnlineUsersList = (onlineUsers: number[]) => {
      setIsOnline(onlineUsers.includes(userId));
    };

    // Kullanıcı statüsü değişikliklerini dinle
    const handleUserStatusChanged = (data: {
      userId: number;
      isOnline: boolean;
    }) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline);
      }
    };

    // Event listener'ları ekle
    socket.on("online_users_list", handleOnlineUsersList);
    socket.on("user_status_changed", handleUserStatusChanged);

    // Cleanup: event listener'ları kaldır
    return () => {
      socket.off("online_users_list", handleOnlineUsersList);
      socket.off("user_status_changed", handleUserStatusChanged);
    };
  }, [userId]);

  // Boyuta göre nokta büyüklüğünü ayarla
  const dotSize = {
    small: 6,
    medium: 10,
    large: 14,
  }[size];

  // Tooltip kullanımı isteğe bağlı
  const statusDot = (
    <StatusDot
      isOnline={isOnline}
      sx={{
        width: dotSize,
        height: dotSize,
        marginRight: size === "small" ? 0.5 : 1,
      }}
    />
  );

  if (withTooltip) {
    return (
      <Tooltip title={isOnline ? "Çevrimiçi" : "Çevrimdışı"} arrow>
        {statusDot}
      </Tooltip>
    );
  }

  return statusDot;
};

export default UserOnlineStatus;
