import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 10,
          minHeight: '70vh',
        }}
      >
        <Typography variant="h1" component="h1" color="primary" sx={{ fontSize: { xs: '6rem', md: '8rem' }, fontWeight: 700 }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Sayfa Bulunamadı
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mb: 4 }}>
          Aradığınız sayfa mevcut değil. Silinmiş, taşınmış veya hiç var olmamış olabilir.
        </Typography>
        
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          size="large" 
          sx={{ fontWeight: 'bold', px: 4 }}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 