import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { Layout } from '../components/layout/Layout';
import { ResourceCard } from '../components/resources/ResourceCard';

import { resourcesService } from '@/services/resources.service';
import type { Resource } from '@/types';
import { LocalStorageService } from '@/services/localStorage.service';

export const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();

  const user = useMemo(() => LocalStorageService.getUser<{ role?: 'USER' | 'ADMIN' }>(), []);

  const [resources, setResources] = useState<Resource[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(search?: string) {
    setLoading(true);
    setErr(null);
    try {
      const rows = await resourcesService.list(search?.trim() ? search.trim() : undefined);
      setResources(rows);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    await load(q);
  }

  return (
    <Layout title="Resources">
      {/* Header row */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Available Resources
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <form onSubmit={onSearch}>
            <TextField
              size="small"
              placeholder="Search name or IP"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <IconButton aria-label="refresh" onClick={() => load(q)} disabled={loading}>
            <RefreshIcon />
          </IconButton>

          {user?.role === 'ADMIN' && (
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettings />}
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </Button>
          )}
        </Box>
      </Box>

      {/* Body */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : err ? (
        <Typography variant="body1" color="error" align="center">
          {err}
        </Typography>
      ) : resources.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No resources found
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </Box>
      )}
    </Layout>
  );
};