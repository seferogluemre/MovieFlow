import { FC, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  InputBase,
  Badge,
  styled,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Person as PersonIcon,
  PlaylistAdd as PlaylistAddIcon,
  ThumbUp as ThumbUpIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import api, { userService } from "../utils/api";
import { User } from "../utils/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  maxWidth: "400px",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255, 255, 255, 0.7)",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

interface Notification {
  id: number;
  userId: number;
  fromUserId: number;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    name?: string;
    profileImage?: string;
  };
  fromUser: {
    id: number;
    username: string;
    name?: string;
    profileImage?: string;
  };
}

enum NotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
  FRIEND_REQUEST_REJECTED = "FRIEND_REQUEST_REJECTED",
}

const MainLayout: FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] =
    useState<boolean>(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  useEffect(() => {
    // Kimlik doğrulama kontrolü fonksiyonu
    const checkAuthAndLoadData = async () => {
      // Kullanıcının oturumu var mı kontrol et
      if (isAuthenticated && user) {
        // Kullanıcı zaten oturum açmış, sadece bildirimleri getir
        fetchNotifications();
        return;
      }

      // Oturum açık değilse, kontrol etmeyi dene
      const isAuth = await checkAuthStatus();

      // Oturum açma başarılı ise bildirimleri getir
      if (isAuth) {
        fetchNotifications();
      }
      // Eğer oturum açma başarısız ve yükleme tamamlandıysa login'e yönlendir
      else if (!isLoading) {
        navigate("/login", { replace: true });
      }
    };

    // Komponent mount olduğunda çalıştır
    checkAuthAndLoadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get("/notifications");
      setNotifications(response.data || []);
      setNotificationError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotificationError("Failed to load notifications");
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationAction = async (
    notificationId: number,
    action: "accept" | "reject" | "markAsRead"
  ) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) return;

      switch (action) {
        case "accept":
          if (notification.type === NotificationType.FRIEND_REQUEST) {
            await api.post(`/friendships/accept/${notification.fromUserId}`);
            await markNotificationAsRead(notificationId);
          }
          break;

        case "reject":
          if (notification.type === NotificationType.FRIEND_REQUEST) {
            await api.post(`/friendships/reject/${notification.fromUserId}`);
            await markNotificationAsRead(notificationId);
          }
          break;

        case "markAsRead":
          await markNotificationAsRead(notificationId);
          break;
      }

      // İşlem tamamlandıktan sonra bildirimleri yenile
      fetchNotifications();
    } catch (error) {
      console.error(`Error handling notification action ${action}:`, error);
    }
  };

  // Bildirimi okundu olarak işaretleme yardımcı fonksiyonu
  const markNotificationAsRead = async (notificationId: number) => {
    await api.patch(`/notifications/${notificationId}/read`);
  };

  const getInitials = (username?: string): string => {
    if (!username) return "U";

    // Kullanıcı adının ilk 2 harfini büyük harfle al
    return username.substring(0, 2).toUpperCase();
  };

  // Bildirim içeriğine göre icon seç
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "FRIEND_REQUEST":
        return <PersonIcon />;
      case "MOVIE_ADDED":
        return <PlaylistAddIcon />;
      case "REVIEW_LIKED":
        return <ThumbUpIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Bildirim tarihi formatla
  const formatNotificationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  const notificationsOpen = Boolean(notificationAnchorEl);
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw", // Viewport genişliği
        maxWidth: "100%", // Maksimum genişlik
        height: "100vh", // Tam ekran yüksekliği
        overflow: "hidden", // Dış taşmaları engelle
        position: "relative", // Konumlandırma için
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%", // Ana içeriği tam genişliğe yay
          height: "100vh", // Tam ekran yüksekliği
          overflowY: "auto", // Dikey kaydırma
          overflowX: "hidden", // Yatay kaydırmayı engelle
          backgroundColor: "background.default", // Arka plan rengini varsayılan tema rengine ayarla
          position: "relative", // Konumlandırma için
        }}
      >
        <AppBar
          position="static"
          color="transparent"
          sx={{
            width: "100%", // AppBar'ı da tam genişliğe yay
            boxShadow: "none",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Toolbar>
            <SearchBar>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search for movies, actors, genres..."
                inputProps={{ "aria-label": "search" }}
              />
            </SearchBar>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex" }}>
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit" sx={{ ml: 1 }}>
                <DarkModeIcon />
              </IconButton>
              <IconButton edge="end" sx={{ ml: 1 }}>
                <Avatar
                  src={
                    user?.profileImage && user.profileImage !== null
                      ? user.profileImage.startsWith("http")
                        ? user.profileImage
                        : `http://localhost:3000/uploads/${user.profileImage}`
                      : undefined
                  }
                  alt={user?.username || "User"}
                >
                  {user ? getInitials(user.username) : "U"}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            p: 3,
            width: "100%", // İçerik alanını tam genişliğe yay
            height: "calc(100vh - 64px)", // AppBar yüksekliği çıkarılmış tam yükseklik
            overflowY: "auto", // Dikey kaydırma
            overflowX: "hidden", // Yatay kaydırmayı engelle
          }}
        >
          <Outlet />
        </Box>

        {/* Bildirimler Popover */}
        <Popover
          open={notificationsOpen}
          anchorEl={notificationAnchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              width: 350,
              maxHeight: 400,
              overflowY: "auto",
              mt: 1,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Bildirimler {unreadCount > 0 && `(${unreadCount})`}
            </Typography>

            {unreadCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={async () => {
                  try {
                    await api.patch("/notifications/read-all");
                    fetchNotifications();
                  } catch (error) {
                    console.error(
                      "Error marking all notifications as read:",
                      error
                    );
                  }
                }}
              >
                Tümünü Okundu İşaretle
              </Button>
            )}
          </Box>

          {loadingNotifications ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notificationError ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{notificationError}</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography>No notifications yet.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  alignItems="flex-start"
                  sx={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                    padding: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        notification.fromUser.profileImage
                          ? `http://localhost:3000/uploads/${notification.fromUser.profileImage}`
                          : undefined
                      }
                      alt={notification.fromUser.username}
                      sx={{
                        bgcolor: notification.isRead
                          ? "grey.700"
                          : "primary.main",
                      }}
                    >
                      {!notification.fromUser.profileImage
                        ? getInitials(notification.fromUser.username)
                        : null}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatNotificationDate(notification.createdAt)}
                        </Typography>

                        {notification.type ===
                          NotificationType.FRIEND_REQUEST &&
                          !notification.isRead && (
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleNotificationAction(
                                    notification.id,
                                    "accept"
                                  )
                                }
                              >
                                Kabul Et
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  handleNotificationAction(
                                    notification.id,
                                    "reject"
                                  )
                                }
                              >
                                Reddet
                              </Button>
                            </Box>
                          )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      variant: "body1",
                      fontWeight: notification.isRead ? "normal" : "bold",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Popover>
      </Box>
    </Box>
  );
};

export default MainLayout;
