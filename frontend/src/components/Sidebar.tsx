import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  Slideshow as MoviesIcon,
  Visibility as WatchlistIcon,
  Favorite as WishlistIcon,
  VideoLibrary as LibraryIcon,
  StarRate as ReviewsIcon,
  People as FriendsIcon,
  Settings as SettingsIcon,
  Movie as FilmIcon,
} from "@mui/icons-material";

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

  // Navigation items data
  const navigationItems = [
    { name: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { name: "Profile", icon: <ProfileIcon />, path: "/profile" },
    { name: "Browse Movies", icon: <MoviesIcon />, path: "/browse" },
    { name: "Watchlist", icon: <WatchlistIcon />, path: "/watchlist" },
    { name: "Wishlist", icon: <WishlistIcon />, path: "/wishlist" },
    { name: "Library", icon: <LibraryIcon />, path: "/library" },
    { name: "My Reviews", icon: <ReviewsIcon />, path: "/reviews" },
    { name: "Friends", icon: <FriendsIcon />, path: "/friends" },
    { name: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: "background.paper",
        height: "100vh",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Logo>
        <FilmIcon sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6" component="div" fontWeight="bold">
          FilmPortal
        </Typography>
      </Logo>

      <List>
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
    </Box>
  );
};

export default Sidebar;
