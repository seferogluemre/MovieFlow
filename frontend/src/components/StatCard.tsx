import { FC, ReactNode } from 'react';
import { Card, Box, Typography, SvgIconProps } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor = 'primary.main'
}) => {
  return (
    <Card 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h3" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: iconColor
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        {title}
      </Typography>
    </Card>
  );
};

export default StatCard; 