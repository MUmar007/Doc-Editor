import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { useAuthStore } from '../../store/authStore';
import { FileUpload } from '../documents/FileUpload';

const DRAWER_WIDTH = 260;

interface Props {
  onCreateDoc: () => void;
}

export function Sidebar({ onCreateDoc }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();
  const { data, isLoading } = useDocuments();

  const recentDocs = [...(data?.owned ?? []), ...(data?.shared ?? [])]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <ArticleIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary.light">
            DocEditor
          </Typography>
        </Box>
      </Toolbar>
      <Divider />

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={onCreateDoc}
          fullWidth
          size="small"
        >
          New Document
        </Button>
        <FileUpload
          trigger={
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              fullWidth
              size="small"
              component="span"
            >
              Upload File
            </Button>
          }
        />
      </Box>

      <Divider />

      <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Recent
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ px: 2, pb: 1 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height={32} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : recentDocs.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1, display: 'block' }}>
          No documents yet
        </Typography>
      ) : (
        <List dense disablePadding sx={{ pb: 1 }}>
          {recentDocs.map((doc) => (
            <ListItemButton
              key={doc.id}
              onClick={() => navigate(`/docs/${doc.id}`)}
              sx={{ px: 2, py: 0.5, borderRadius: 1, mx: 1 }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" noWrap sx={{ fontSize: 13 }}>
                    {doc.title}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}

      <Divider />

      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircleIcon fontSize="small" color="primary" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {user?.display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout} color="inherit">
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}
