import { FC, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  action?: ReactNode;
}

const SectionHeader: FC<SectionHeaderProps> = ({ 
  title,
  subtitle,
  viewAllLink,
  action
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      mb: 2
    }}>
      <Box>
        <Typography variant="h5" fontWeight="bold">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box>
        {action ? action : (
          viewAllLink && (
            <Button
              component={Link}
              to={viewAllLink}
              variant="text"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          )
        )}
      </Box>
    </Box>
  );
};

export default SectionHeader; 