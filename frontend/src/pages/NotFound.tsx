import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}
    >
      <Typography variant="h1" sx={{ mb: 2 }}>404</Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>Sayfa Bulunamadı</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        to="/"
      >
        Ana Sayfaya Dön
      </Button>
    </Box>
  );
};

export default NotFound; 