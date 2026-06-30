import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '../../hooks/useComments';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 300;

interface Props {
  docId: string;
  open: boolean;
  onClose: () => void;
}

export function CommentsPanel({ docId, open, onClose }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const { data: comments, isLoading } = useComments(docId);
  const createComment = useCreateComment(docId);
  const updateComment = useUpdateComment(docId);
  const deleteComment = useDeleteComment(docId);
  const [body, setBody] = useState('');

  const handleSubmit = async () => {
    const text = body.trim();
    if (!text) return;
    await createComment.mutateAsync({ body: text });
    setBody('');
  };

  const unresolvedCount = comments?.filter((c) => !c.resolved).length ?? 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper' } }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          Comments
        </Typography>
        {unresolvedCount > 0 && (
          <Chip label={unresolvedCount} size="small" color="primary" />
        )}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      {/* New comment input */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          multiline
          minRows={2}
          maxRows={6}
          fullWidth
          size="small"
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              void handleSubmit();
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<SendIcon />}
            onClick={() => void handleSubmit()}
            disabled={!body.trim() || createComment.isPending}
          >
            Comment
          </Button>
        </Box>
      </Box>

      {/* Comments list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !comments?.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No comments yet. Be the first to leave one.
          </Typography>
        ) : (
          comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                opacity: comment.resolved ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar sx={{ width: 22, height: 22, fontSize: 10 }}>
                  {comment.author.display_name[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {comment.author.display_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {new Date(comment.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', my: 1 }}>
                {comment.body}
              </Typography>

              {comment.resolved && (
                <Chip label="Resolved" size="small" color="success" variant="outlined" sx={{ mb: 1 }} />
              )}

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={comment.resolved ? 'Unresolve' : 'Mark resolved'}>
                  <IconButton
                    size="small"
                    color={comment.resolved ? 'default' : 'success'}
                    onClick={() =>
                      updateComment.mutate({ id: comment.id, resolved: !comment.resolved })
                    }
                    disabled={updateComment.isPending}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {currentUser?.id === comment.author_id && (
                  <Tooltip title="Delete comment">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteComment.mutate(comment.id)}
                      disabled={deleteComment.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Drawer>
  );
}

// Export a badge-wrapped trigger button for use in the toolbar
export function CommentsBadge({ count }: { count: number }) {
  return (
    <Badge badgeContent={count} color="primary" max={99}>
      <span />
    </Badge>
  );
}
