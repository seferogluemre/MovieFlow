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
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
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

  const handleNotificationAction = (notificationId: number, type: string) => {
    console.log(`Notification action: ${type}, id: ${notificationId}`);
    // Burada notifications API'sine istek atılabilir mark as read gibi
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
    (notification) => !notification.read
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
                <Avatar src={user?.profileImage} alt={user?.username}>
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
            sx={{ p: 2, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Notifications
            </Typography>
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
                    backgroundColor: notification.read
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: notification.read
                          ? "grey.700"
                          : "primary.main",
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.content}
                    secondary={formatNotificationDate(notification.createdAt)}
                    primaryTypographyProps={{
                      variant: "body1",
                      fontWeight: notification.read ? "normal" : "bold",
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      color: "text.secondary",
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
