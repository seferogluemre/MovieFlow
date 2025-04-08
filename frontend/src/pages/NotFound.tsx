import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" className="flex h-screen flex-col items-center justify-center text-center">
      <Typography variant="h1" className="mb-4 text-8xl font-bold text-primary">
        404
      </Typography>
      <Typography variant="h4" className="mb-6">
        Oops! Page not found.
      </Typography>
      <Typography variant="body1" className="mb-8 text-muted-foreground">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Box>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/')}
        >
          Go Back Home
        </Button>
      </Box>
    </Container>
  );
} 