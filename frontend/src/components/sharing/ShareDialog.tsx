import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getUsers } from '../../api/users';
import { useCreateShare, useDeleteShare, useShares } from '../../hooks/useShares';
import { useAuthStore } from '../../store/authStore';
import type { DocumentListItem } from '../../types';

interface Props {
  doc: DocumentListItem;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ doc, open, onClose }: Props) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('edit');
  const [shareError, setShareError] = useState('');
  const currentUser = useAuthStore((s) => s.user);

  const { data: shares = [], isLoading } = useShares(doc.id);
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: Infinity,
  });

  const createShare = useCreateShare(doc.id);
  const deleteShare = useDeleteShare(doc.id);

  const sharedUserIds = new Set(shares.map((s) => s.shared_with));
  const availableUsers = users.filter(
    (u) => u.id !== currentUser?.id && u.id !== doc.owner_id && !sharedUserIds.has(u.id)
  );

  const handleShare = async () => {
    if (!selectedUserId) return;
    setShareError('');
    try {
      await createShare.mutateAsync({ shared_with: selectedUserId, permission });
      setSelectedUserId('');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setShareError(msg ?? 'Failed to share document');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon color="primary" />
          <Typography variant="h6">Share "{doc.title}"</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {doc.is_owned && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Share with a user
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Select user</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Select user"
                >
                  {availableUsers.length === 0 ? (
                    <MenuItem disabled>No users available</MenuItem>
                  ) : (
                    availableUsers.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.display_name} ({u.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Permission</InputLabel>
                <Select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                  label="Permission"
                >
                  <MenuItem value="edit">Can edit</MenuItem>
                  <MenuItem value="view">Can view</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleShare}
                disabled={!selectedUserId || createShare.isPending}
                size="small"
              >
                Share
              </Button>
            </Box>

            {shareError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setShareError('')}>
                {shareError}
              </Alert>
            )}

            <Divider sx={{ mb: 2 }} />
          </>
        )}

        <Typography variant="subtitle2" gutterBottom>
          People with access
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        ) : shares.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Not shared with anyone yet.
          </Typography>
        ) : (
          <List dense disablePadding>
            {shares.map((share) => (
              <ListItem
                key={share.id}
                secondaryAction={
                  doc.is_owned && (
                    <Tooltip title="Revoke access">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => deleteShare.mutate(share.shared_with)}
                        disabled={deleteShare.isPending}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 13 }}>
                    {share.user.display_name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={share.user.display_name}
                  secondary={share.user.email}
                />
                <Chip
                  label={share.permission === 'edit' ? 'Can edit' : 'Can view'}
                  size="small"
                  color={share.permission === 'edit' ? 'primary' : 'default'}
                  variant="outlined"
                  sx={{ mr: doc.is_owned ? 4 : 0 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
