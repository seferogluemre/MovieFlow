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
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { userService } from "../utils/api";
import { User } from "../utils/types";

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const getInitials = (name?: string): string => {
    if (!name) return "U";

    return (
      name
        .split(" ")
        .map((part) => (part.length > 0 ? part[0] : ""))
        .join("")
        .toUpperCase() || "U"
    );
  };

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
              <IconButton color="inherit">
                <Badge badgeContent={1} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit" sx={{ ml: 1 }}>
                <DarkModeIcon />
              </IconButton>
              <IconButton edge="end" sx={{ ml: 1 }}>
                <Avatar
                  src={user?.profileImage}
                  alt={user?.name || user?.username}
                >
                  {user ? getInitials(user.name || user.username) : "U"}
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
      </Box>
    </Box>
  );
};

export default MainLayout;
