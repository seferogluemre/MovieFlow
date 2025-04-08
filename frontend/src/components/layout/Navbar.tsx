import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationIcon,
  AccountCircle,
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
  Movie as MovieIcon,
  BookmarkBorder as WatchlistIcon,
  Favorite as WishlistIcon,
  VideoLibrary as LibraryIcon,
  People as FriendsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useCustomTheme();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Profile menu handlers
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Notifications menu handlers
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
    // Here you could mark notifications as read
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };
  
  // Mobile drawer handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/login');
  };
  
  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  
  // Fetch notifications when component mounts
  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        const response = await userService.getNotifications();
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      }
    };
    
    fetchNotifications();
  }, [isAuthenticated]);
  
  const unreadNotifications = notifications.filter(notification => !notification.isRead);
  
  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Ana Sayfa" />
        </ListItem>
        <ListItem button component={Link} to="/movies">
          <ListItemIcon><MovieIcon /></ListItemIcon>
          <ListItemText primary="Filmler" />
        </ListItem>
        {isAuthenticated && (
          <>
            <ListItem button component={Link} to="/watchlist">
              <ListItemIcon><WatchlistIcon /></ListItemIcon>
              <ListItemText primary="İzleme Listesi" />
            </ListItem>
            <ListItem button component={Link} to="/wishlist">
              <ListItemIcon><WishlistIcon /></ListItemIcon>
              <ListItemText primary="Favori Filmler" />
            </ListItem>
            <ListItem button component={Link} to="/library">
              <ListItemIcon><LibraryIcon /></ListItemIcon>
              <ListItemText primary="Kütüphane" />
            </ListItem>
            <ListItem button component={Link} to="/friends">
              <ListItemIcon><FriendsIcon /></ListItemIcon>
              <ListItemText primary="Arkadaşlar" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: muiTheme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              textDecoration: 'none', 
              color: 'inherit',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            MovieFlow
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Search Bar */}
          <Box 
            component="form" 
            onSubmit={handleSearch}
            sx={{ 
              position: 'relative', 
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
              marginRight: 2,
              marginLeft: 2,
              width: { xs: '50%', sm: 'auto' }
            }}
          >
            <Box sx={{ padding: '0 16px', height: '100%', position: 'absolute', display: 'flex', alignItems: 'center' }}>
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Film Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: 'inherit',
                padding: '8px 8px 8px 48px',
                width: '100%',
                minWidth: { sm: 220 }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            {/* Theme Toggle */}
            <IconButton color="inherit" onClick={toggleTheme}>
              {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <IconButton color="inherit" onClick={handleNotificationsOpen}>
                  <Badge badgeContent={unreadNotifications.length} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
                
                {/* User Menu */}
                <IconButton
                  edge="end"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  {user?.profileImage ? (
                    <Avatar 
                      src={user.profileImage} 
                      alt={user.username} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Giriş Yap
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Kayıt Ol
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
          Profilim
        </MenuItem>
        <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
          Ayarlar
        </MenuItem>
        <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationsClose}
              sx={{ opacity: notification.isRead ? 0.6 : 1 }}
            >
              {notification.message}
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationsClose}>
            Bildirim yok
          </MenuItem>
        )}
      </Menu>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar; 