import React, { useState } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/global.scss';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box className={theme}>
      <CssBaseline />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Sidebar */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      
      {/* Main content */}
      <Box
        component="main"
        className="page-container"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', md: `calc(100% - 240px)` },
          marginLeft: { xs: 0, md: '240px' },
          marginTop: '64px', // AppBar height
          minHeight: 'calc(100vh - 64px)' // Full height minus AppBar
        }}
      >
        <Container maxWidth="xl" className="page-content">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
