import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import { Alert, AppBar, Box, Button, IconButton, Toolbar, Tooltip } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { DocumentRename } from '../components/editor/DocumentRename';
import { SaveIndicator } from '../components/editor/SaveIndicator';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { AppShell } from '../components/layout/AppShell';
import { ShareDialog } from '../components/sharing/ShareDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useDocument, useUpdateDocument } from '../hooks/useDocuments';
import { useAuthStore } from '../store/authStore';
import type { TiptapContent } from '../types';
import type { Editor } from '@tiptap/react';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { data: doc, isLoading, error } = useDocument(id!);
  const updateDoc = useUpdateDocument(id!);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = doc?.owner_id === currentUser?.id;
  const canEdit = isOwner || doc?.shared_by !== undefined;

  const scheduleAutoSave = useCallback(
    (content: TiptapContent) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setIsSaving(true);
      saveTimer.current = setTimeout(async () => {
        try {
          await updateDoc.mutateAsync({ content });
          setLastSaved(new Date());
        } finally {
          setIsSaving(false);
        }
      }, 800);
    },
    [updateDoc]
  );

  const handleRename = useCallback(
    (title: string) => {
      updateDoc.mutate({ title });
    },
    [updateDoc]
  );

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <AppShell>
        <LoadingSpinner />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Alert severity="error" sx={{ m: 3 }}>
          {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to load document'}
        </Alert>
      </AppShell>
    );
  }

  if (!doc) return null;

  return (
    <AppShell>
      <AppBar position="sticky" elevation={0} sx={{ top: 0 }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="Back to documents">
            <IconButton size="small" onClick={() => navigate('/')}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <DocumentRename title={doc.title} onRename={handleRename} readOnly={!canEdit} />

          <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />

          {isOwner && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              onClick={() => setShareOpen(true)}
              sx={{ ml: 1 }}
            >
              Share
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <EditorToolbar editor={editor} readOnly={!canEdit} />

      <Box
        sx={{
          flex: 1,
          bgcolor: '#1E2D40',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <TiptapEditor
          content={doc.content}
          onUpdate={scheduleAutoSave}
          editable={canEdit}
          onEditorReady={setEditor}
        />
      </Box>

      {shareOpen && (
        <ShareDialog doc={doc} open={shareOpen} onClose={() => setShareOpen(false)} />
      )}
    </AppShell>
  );
}
