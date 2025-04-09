import { FC } from "react";
import { Outlet } from "react-router-dom";
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
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          color="transparent"
          sx={{
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
                <Avatar>JD</Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
