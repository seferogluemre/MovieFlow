import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          MovieFlow'a Hoş Geldiniz
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          En iyi filmler ve dizileri keşfedin, izleme listenizi oluşturun ve arkadaşlarınızla paylaşın.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 