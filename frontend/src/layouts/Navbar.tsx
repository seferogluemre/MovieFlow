import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { IconButton, Menu, MenuItem, Badge, InputBase } from '@mui/material';

export default function Navbar() {
  const { mode, toggleMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center md:hidden">
        <IconButton edge="start" aria-label="menu">
          <MenuIcon />
        </IconButton>
      </div>

      <div className="hidden items-center md:flex">
        <Link to="/" className="text-xl font-bold text-primary">
          MovieFlow
        </Link>
      </div>

      <div className="mx-4 flex flex-1 items-center max-w-md rounded-md border bg-background px-3 py-2">
        <SearchIcon className="mr-2 text-muted-foreground" />
        <InputBase
          placeholder="Search movies, actors..."
          className="ml-1 flex-1"
          inputProps={{ 'aria-label': 'search movies' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <IconButton onClick={toggleMode} aria-label="toggle theme">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        
        <IconButton aria-label="notifications">
          <Badge badgeContent={4} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </div>
    </header>
  );
} 