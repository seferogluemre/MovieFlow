import {
  Dashboard as DashboardIcon,
  Movie as FilmIcon,
  People as FriendsIcon,
  VideoLibrary as LibraryIcon,
  ExitToApp as LogoutIcon,
  Slideshow as MoviesIcon,
  Person as ProfileIcon,
  StarRate as ReviewsIcon,
  StarRate as StarRateIcon,
  Visibility as WatchlistIcon,
  Favorite as WishlistIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
} from "@mui/material";
import { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../utils/api";

// Create a styled component for the logo
const Logo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(1),
}));

// Create a styled component for the active list item
const StyledListItem = styled(ListItem)<{ active: number }>(
  ({ theme, active }) => ({
    borderRadius: "8px",
    margin: "4px 8px",
    backgroundColor: active ? "rgba(108, 93, 211, 0.1)" : "transparent",
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "rgba(108, 93, 211, 0.05)",
    },
  })
);

const Sidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items data
  const navigationItems = [
    { name: "Ana Sayfa", icon: <DashboardIcon />, path: "/" },
    { name: "Profil", icon: <ProfileIcon />, path: "/profile" },
    { name: "Filmlere Göz At", icon: <MoviesIcon />, path: "/browse" },
    { name: "İzleme Listesi", icon: <WatchlistIcon />, path: "/watchlist" },
    { name: "İstek Listesi", icon: <WishlistIcon />, path: "/wishlist" },
    { name: "Kütüphane", icon: <LibraryIcon />, path: "/library" },
    { name: "Değerlendirmelerim", icon: <ReviewsIcon />, path: "/reviews" },
    {
      name: "Film Puanlarım",
      icon: <StarRateIcon />,
      path: "/ratings",
    },
    { name: "Arkadaşlar", icon: <FriendsIcon />, path: "/friends" },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: "background.paper",
        height: "100vh",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Logo>
        <FilmIcon sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6" component="div" fontWeight="bold">
          Film Portalı
        </Typography>
      </Logo>

      <List sx={{ flexGrow: 1 }}>
        {navigationItems.map((item) => (
          <StyledListItem
            key={item.name}
            component={Link}
            to={item.path}
            active={location.pathname === item.path ? 1 : 0}
            sx={{
              textDecoration: "none",
              py: 1.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color:
                  location.pathname === item.path
                    ? "primary.main"
                    : "text.primary",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </StyledListItem>
        ))}
      </List>

      <Divider
        sx={{ mx: 2, my: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      />

      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            py: 1,
          }}
        >
          Çıkış Yap
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
