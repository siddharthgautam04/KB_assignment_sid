import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Resource } from '../../types';

interface ResourceCardProps {
  resource: Resource;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const navigate = useNavigate();

  // Normalize to a safe value
  const status = (resource.status ?? 'unknown') as NonNullable<Resource['status']>;

  const getStatusColor = (s: typeof status) => {
    switch (s) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      case 'unknown':
      default:
        return 'default';
    }
  };

  const statusLabel = (s: typeof status) => {
    switch (s) {
      case 'up':
        return 'Up';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  const handleViewDetails = () => {
    navigate(`/resources/${resource.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {resource.name}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            IP: {resource.ip}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type: {resource.type ?? '—'}
          </Typography>
        </Box>
        <Chip
          label={statusLabel(status)}
          color={getStatusColor(status) as any}
          size="small"
        />
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};