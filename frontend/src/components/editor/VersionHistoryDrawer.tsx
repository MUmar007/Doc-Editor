import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { generateHTML } from '@tiptap/core';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { diffWords } from 'diff';
import { useState } from 'react';
import { useSaveVersion, useRestoreVersion, useVersions } from '../../hooks/useVersions';
import type { DocumentVersion, TiptapContent } from '../../types';

const DRAWER_WIDTH = 280;

// ── helpers ────────────────────────────────────────────────────────────────

function versionToHtml(content: TiptapContent): string {
  try {
    return generateHTML(content as Parameters<typeof generateHTML>[0], [StarterKit, Underline]);
  } catch {
    return '<p><em>Preview unavailable.</em></p>';
  }
}

type TiptapNode = { type: string; text?: string; content?: TiptapNode[] };

function extractText(node: TiptapNode): string {
  if (node.type === 'text') return node.text ?? '';
  const block = ['paragraph', 'heading', 'listItem', 'bulletList', 'orderedList'];
  const sep = block.includes(node.type) ? '\n' : '';
  return (node.content ?? []).map(extractText).join('') + sep;
}

// ── diff view ─────────────────────────────────────────────────────────────

interface DiffViewProps {
  currentContent: TiptapContent;
  versionContent: TiptapContent;
}

function DiffView({ currentContent, versionContent }: DiffViewProps) {
  const currentText = extractText(currentContent as TiptapNode).trim();
  const versionText = extractText(versionContent as TiptapNode).trim();
  const changes = diffWords(currentText, versionText);

  const hasChanges = changes.some((c) => c.added || c.removed);

  if (!hasChanges) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No differences — this version is identical to the current document.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#2d4a2d', border: '1px solid #4caf50', borderRadius: 0.5 }} />
          <Typography variant="caption" color="text.secondary">Added by restoring</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#4a1e1e', border: '1px solid #f44336', borderRadius: 0.5 }} />
          <Typography variant="caption" color="text.secondary">Removed by restoring</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          fontFamily: 'Inter, Roboto, sans-serif',
          fontSize: 14,
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'text.primary',
        }}
      >
        {changes.map((change, i) => {
          if (change.removed) {
            return (
              <Box
                key={i}
                component="span"
                sx={{
                  bgcolor: '#4a1e1e',
                  color: '#ff8a80',
                  textDecoration: 'line-through',
                  borderRadius: '3px',
                  px: 0.25,
                }}
              >
                {change.value}
              </Box>
            );
          }
          if (change.added) {
            return (
              <Box
                key={i}
                component="span"
                sx={{
                  bgcolor: '#1e3a2f',
                  color: '#69f0ae',
                  borderRadius: '3px',
                  px: 0.25,
                }}
              >
                {change.value}
              </Box>
            );
          }
          return <span key={i}>{change.value}</span>;
        })}
      </Box>
    </Box>
  );
}

// ── preview dialog ─────────────────────────────────────────────────────────

interface PreviewDialogProps {
  version: DocumentVersion;
  currentContent: TiptapContent;
  onClose: () => void;
  onRestore: () => void;
  restoring: boolean;
}

function VersionPreviewDialog({
  version,
  currentContent,
  onClose,
  onRestore,
  restoring,
}: PreviewDialogProps) {
  const [tab, setTab] = useState(0);
  const html = versionToHtml(version.content);

  const timestamp = new Date(version.created_at).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {version.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Saved {timestamp} · by {version.author.display_name}
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          sx={{ mt: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Preview" sx={{ fontSize: 13 }} />
          <Tab label="Changes vs current" sx={{ fontSize: 13 }} />
        </Tabs>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, minHeight: 320 }}>
        {tab === 0 ? (
          <Box
            sx={{
              maxHeight: '60vh',
              overflow: 'auto',
              px: 6,
              py: 4,
              bgcolor: '#1E2D40',
              '& h1': { fontSize: '2rem', fontWeight: 700, my: 1, color: 'text.primary' },
              '& h2': { fontSize: '1.5rem', fontWeight: 600, my: 1, color: 'text.primary' },
              '& h3': { fontSize: '1.25rem', fontWeight: 600, my: 0.75, color: 'text.primary' },
              '& p':  { my: 0.5, lineHeight: 1.75, color: 'text.primary' },
              '& ul, & ol': { pl: 3, my: 0.5 },
              '& li': { mb: 0.25, color: 'text.primary' },
              '& strong': { fontWeight: 700 },
              '& em': { fontStyle: 'italic' },
              '& u': { textDecoration: 'underline' },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', bgcolor: 'background.default' }}>
            <DiffView currentContent={currentContent} versionContent={version.content} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<RestoreIcon />}
          onClick={onRestore}
          disabled={restoring}
        >
          {restoring ? 'Restoring…' : 'Restore this version'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── main drawer ────────────────────────────────────────────────────────────

interface Props {
  docId: string;
  open: boolean;
  onClose: () => void;
  currentContent: TiptapContent;
}

export function VersionHistoryDrawer({ docId, open, onClose, currentContent }: Props) {
  const { data: versions, isLoading } = useVersions(docId);
  const saveVersion = useSaveVersion(docId);
  const restoreVersion = useRestoreVersion(docId);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);

  const handleRestore = async () => {
    if (!previewVersion) return;
    await restoreVersion.mutateAsync(previewVersion.id);
    setPreviewVersion(null);
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="temporary"
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            Version History
          </Typography>
          <Tooltip title="Save snapshot now">
            <IconButton
              size="small"
              onClick={() => saveVersion.mutate()}
              disabled={saveVersion.isPending}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !versions?.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No versions yet. Versions are saved automatically every 30s, or click the save icon
            above to capture one now.
          </Typography>
        ) : (
          <List dense disablePadding>
            {versions.map((v) => (
              <ListItemButton
                key={v.id}
                onClick={() => setPreviewVersion(v)}
                sx={{ px: 2, py: 1.5 }}
              >
                <ListItemText
                  primary={new Date(v.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  secondary={`by ${v.author.display_name}`}
                  slotProps={{
                    primary: { variant: 'body2', sx: { fontWeight: 500 } },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Drawer>

      {previewVersion && (
        <VersionPreviewDialog
          version={previewVersion}
          currentContent={currentContent}
          onClose={() => setPreviewVersion(null)}
          onRestore={() => void handleRestore()}
          restoring={restoreVersion.isPending}
        />
      )}
    </>
  );
}
