import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  Movie as MovieIcon,
  Theaters as GenresIcon,
  BookmarkBorder as WatchlistIcon,
  Favorite as WishlistIcon,
  VideoLibrary as LibraryIcon,
  People as FriendsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Genre } from '../../types';
import { movieService } from '../../services/movieService';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [genres, setGenres] = React.useState<Genre[]>([]);
  
  React.useEffect(() => {
    const fetchGenres = async () => {
      const response = await movieService.getGenres();
      if (response.success && response.data) {
        setGenres(response.data);
      }
    };
    
    fetchGenres();
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <List component="nav">
        <ListItemButton component={Link} to="/">
          <ListItemIcon>
            <HomeIcon color={isActive('/') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Ana Sayfa" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/movies">
          <ListItemIcon>
            <MovieIcon color={isActive('/movies') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Tüm Filmler" />
        </ListItemButton>
      </List>
      
      <Divider />
      
      {isAuthenticated && (
        <>
          <List component="nav">
            <Typography
              variant="overline"
              sx={{ px: 2, mt: 1, display: 'block', color: 'text.secondary' }}
            >
              Kişisel
            </Typography>
            
            <ListItemButton component={Link} to="/watchlist">
              <ListItemIcon>
                <WatchlistIcon color={isActive('/watchlist') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="İzleme Listesi" />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/wishlist">
              <ListItemIcon>
                <WishlistIcon color={isActive('/wishlist') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Favori Filmler" />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/library">
              <ListItemIcon>
                <LibraryIcon color={isActive('/library') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Kütüphane" />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/friends">
              <ListItemIcon>
                <FriendsIcon color={isActive('/friends') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Arkadaşlar" />
            </ListItemButton>
          </List>
          
          <Divider />
        </>
      )}
      
      <List component="nav">
        <Typography
          variant="overline"
          sx={{ px: 2, mt: 1, display: 'block', color: 'text.secondary' }}
        >
          Kategoriler
        </Typography>
        
        {Array.isArray(genres) && genres.map((genre) => (
          <ListItemButton
            key={genre.id}
            component={Link}
            to={`/genres/${genre.id}`}
            selected={isActive(`/genres/${genre.id}`)}
          >
            <ListItemIcon>
              <GenresIcon color={isActive(`/genres/${genre.id}`) ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary={genre.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
  
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240, 
            boxSizing: 'border-box',
            marginTop: '64px' // AppBar height
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': { 
          width: 240, 
          boxSizing: 'border-box',
          marginTop: '64px', // AppBar height
          height: 'calc(100% - 64px)' // Subtract AppBar height
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 