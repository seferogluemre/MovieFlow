import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  styled,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { FC, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useFriendship } from "../context/FriendshipContext";
import { useTheme } from "../context/ThemeContext";
import { NotificationType } from "../utils/types";

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

const MainLayout: FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const {
    notifications,
    loadingNotifications,
    error: notificationError,
    updateNotificationsList: fetchNotifications,
    acceptFriendRequest,
    rejectFriendRequest,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useFriendship();

  const [shouldShake, setShouldShake] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  useEffect(() => {
    // Authentication check function
    const checkAuthAndLoadData = async () => {
      // Check if user is already authenticated
      if (isAuthenticated && user) {
        // User is already logged in, just fetch notifications
        fetchNotifications();
        return;
      }

      const isAuth = await checkAuthStatus();

      if (isAuth) {
        fetchNotifications();
      }
      // If login failed and loading is complete, redirect to login
      else if (!isLoading) {
        navigate("/login", { replace: true });
      }
    };

    // Run when component mounts
    checkAuthAndLoadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationAction = async (
    notificationId: number,
    action: "accept" | "reject" | "markAsRead" | "viewProfile"
  ) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) return;

      // Get friendshipId from metadata
      const friendshipId = notification.metadata?.friendshipId;

      switch (action) {
        case "accept":
          if (notification.type === NotificationType.FRIEND_REQUEST) {
            if (friendshipId) {
              await acceptFriendRequest(friendshipId);
              await markNotificationAsRead(notificationId);
            }
          }
          break;

        case "reject":
          if (notification.type === NotificationType.FRIEND_REQUEST) {
            if (friendshipId) {
              console.log(`Rejecting friendship ID: ${friendshipId}`);
              await rejectFriendRequest(friendshipId);
              console.log("Friendship rejected successfully");
              await markNotificationAsRead(notificationId);
            }
          }
          break;

        case "markAsRead":
          await markNotificationAsRead(notificationId);
          break;

        case "viewProfile":
          await markNotificationAsRead(notificationId);
          handleNotificationClose();
          navigate(`/profile/${notification.fromUserId}`);
          break;
      }
    } catch (error) {
      console.error(`Error handling notification action ${action}:`, error);
    }
  };

  const getInitials = (username?: string): string => {
    if (!username) return "U";

    // Kullanıcı adının ilk 2 harfini büyük harfle al
    return username.substring(0, 2).toUpperCase();
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  const notificationsOpen = Boolean(notificationAnchorEl);

  useEffect(() => {
    if (notifications.filter((n) => !n.isRead).length === 0) return;

    const interval = setInterval(() => {
      setShouldShake(true);

      // Titreme bittikten sonra class'ı kaldır
      setTimeout(() => {
        setShouldShake(false);
      }, 400); // bu süre CSS animasyon süresi ile aynı olmalı (0.4s)
    }, 3000); // her 4 saniyede bir tekrar titre

    return () => clearInterval(interval);
  }, [notifications.filter((n) => !n.isRead).length]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
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
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <Badge
                  badgeContent={notifications.filter((n) => !n.isRead).length}
                  color="error"
                  invisible={
                    notifications.filter((n) => !n.isRead).length === 0
                  }
                >
                  <NotificationsIcon className={shouldShake ? "shake" : ""} />
                </Badge>
              </IconButton>
              <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
                <IconButton
                  color="inherit"
                  sx={{ ml: 1 }}
                  onClick={toggleTheme}
                >
                  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Profil">
                <IconButton
                  edge="end"
                  sx={{ ml: 1 }}
                  onClick={() => navigate(`/profile/${user?.id}`)}
                >
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
              </Tooltip>
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
              Bildirimler{" "}
              {notifications.filter((n) => !n.isRead).length > 0 &&
                `(${notifications.filter((n) => !n.isRead).length})`}
            </Typography>

            {notifications.filter((n) => !n.isRead).length > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={async () => {
                  try {
                    await markAllNotificationsAsRead();
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
                        notification.fromUser?.profileImage
                          ? notification.fromUser.profileImage.startsWith(
                              "http"
                            )
                            ? notification.fromUser.profileImage
                            : `http://localhost:3000/uploads/${notification.fromUser.profileImage}`
                          : undefined
                      }
                      alt={notification.fromUser?.username}
                      sx={{
                        bgcolor: notification.isRead
                          ? "grey.700"
                          : "primary.main",
                        cursor: "pointer",
                      }}
                    >
                      {!notification.fromUser?.profileImage
                        ? getInitials(notification.fromUser?.username)
                        : null}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="body1"
                          component="span"
                          sx={{
                            fontWeight: notification.isRead ? "normal" : "bold",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleNotificationAction(
                              notification.id,
                              "viewProfile"
                            )
                          }
                        >
                          {notification.fromUser?.name ||
                            notification.fromUser?.username}
                        </Typography>
                        <Typography variant="body1" component="span" ml={1}>
                          {notification.message.replace(
                            notification.fromUser?.username || "",
                            ""
                          )}
                        </Typography>
                      </Box>
                    }
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

      {/* Add the ChatWidget component */}
      <ChatWidget />
    </Box>
  );
};

export default MainLayout;
