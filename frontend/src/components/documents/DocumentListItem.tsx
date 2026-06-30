import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useDeleteDocument } from '../../hooks/useDocuments';
import type { DocumentListItem } from '../../types';

interface Props {
  doc: DocumentListItem;
}

export function DocumentListItemCard({ doc }: Props) {
  const navigate = useNavigate();
  const deleteDoc = useDeleteDocument();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formattedDate = new Date(doc.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    deleteDoc.mutate(doc.id, { onSuccess: () => setConfirmOpen(false) });
  };

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => navigate(`/docs/${doc.id}`)}
          sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
        >
          <ListItemText
            sx={{ my: 0 }}
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 500 }}>
                  {doc.title}
                </Typography>
                {doc.is_owned ? (
                  <Chip label="Owner" size="small" color="primary" variant="outlined" />
                ) : (
                  <Chip label="Shared" size="small" color="secondary" variant="outlined" />
                )}
                {doc.is_owned && (
                  <Tooltip title="Delete document">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmOpen(true);
                      }}
                      disabled={deleteDoc.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {doc.is_owned
                  ? `Updated ${formattedDate}`
                  : `Shared by ${doc.shared_by?.display_name ?? doc.owner.display_name} · ${formattedDate}`}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete document"
        message={`"${doc.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteDoc.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
