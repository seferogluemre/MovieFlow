import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
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
  Stars as TopRatedIcon,
  NewReleases as NewReleasesIcon,
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
        <ListItem 
          button 
          component={Link} 
          to="/"
          selected={isActive('/')}
        >
          <ListItemIcon>
            <HomeIcon color={isActive('/') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Ana Sayfa" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/movies"
          selected={isActive('/movies')}
        >
          <ListItemIcon>
            <MovieIcon color={isActive('/movies') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Tüm Filmler" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/movies/top-rated"
          selected={isActive('/movies/top-rated')}
        >
          <ListItemIcon>
            <TopRatedIcon color={isActive('/movies/top-rated') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="En Çok Puanlananlar" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/movies/new-releases"
          selected={isActive('/movies/new-releases')}
        >
          <ListItemIcon>
            <NewReleasesIcon color={isActive('/movies/new-releases') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Yeni Çıkanlar" />
        </ListItem>
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
            
            <ListItem 
              button 
              component={Link} 
              to="/watchlist"
              selected={isActive('/watchlist')}
            >
              <ListItemIcon>
                <WatchlistIcon color={isActive('/watchlist') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="İzleme Listesi" />
            </ListItem>
            
            <ListItem 
              component={Link} 
              to="/wishlist"
              selected={isActive('/wishlist')}
            >
              <ListItemIcon>
                <WishlistIcon color={isActive('/wishlist') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Favori Filmler" />
            </ListItem>
            
            <ListItem 
               
              component={Link} 
              to="/library"
              selected={isActive('/library')}
            >
              <ListItemIcon>
                <LibraryIcon color={isActive('/library') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Kütüphane" />
            </ListItem>
            
            <ListItem 
              button 
              component={Link} 
              to="/friends"
              selected={isActive('/friends')}
            >
              <ListItemIcon>
                <FriendsIcon color={isActive('/friends') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Arkadaşlar" />
            </ListItem>
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
        
        {genres.map((genre) => (
          <ListItem 
            key={genre.id}
            button 
            component={Link} 
            to={`/genres/${genre.id}`}
            selected={isActive(`/genres/${genre.id}`)}
          >
            <ListItemIcon>
              <GenresIcon color={isActive(`/genres/${genre.id}`) ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary={genre.name} />
          </ListItem>
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