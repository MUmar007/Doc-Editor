import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CommentIcon from '@mui/icons-material/Comment';
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
} from '@mui/material';
import type { Editor } from '@tiptap/react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CommentsPanel } from '../components/editor/CommentsPanel';
import { DocumentRename } from '../components/editor/DocumentRename';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { ExportMenu } from '../components/editor/ExportMenu';
import { PresenceAvatars } from '../components/editor/PresenceAvatars';
import { SaveIndicator } from '../components/editor/SaveIndicator';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { VersionHistoryDrawer } from '../components/editor/VersionHistoryDrawer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppShell } from '../components/layout/AppShell';
import { ShareDialog } from '../components/sharing/ShareDialog';
import { useComments } from '../hooks/useComments';
import { useDocument, useUpdateDocument } from '../hooks/useDocuments';
import { useAuthStore } from '../store/authStore';
import type { TiptapContent } from '../types';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { data: doc, isLoading, error } = useDocument(id!);
  const updateDoc = useUpdateDocument(id!);
  const { data: comments } = useComments(id!);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = doc?.owner_id === currentUser?.id;
  // Fix: use the server-supplied permission level, not a local heuristic
  const canEdit = doc ? doc.my_permission !== 'view' : false;

  const unresolvedComments = comments?.filter((c) => !c.resolved).length ?? 0;

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

          {/* All viewers including current user */}
          <PresenceAvatars docId={id!} currentUser={currentUser} />

          {/* Comments */}
          <Tooltip title="Comments">
            <IconButton size="small" onClick={() => setCommentsOpen(true)}>
              <Badge badgeContent={unresolvedComments} color="primary" max={99}>
                <CommentIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Version history — hidden for view-only users, they can't restore */}
          {canEdit && (
            <Tooltip title="Version history">
              <IconButton size="small" onClick={() => setHistoryOpen(true)}>
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Export */}
          <ExportMenu
            title={doc.title}
            content={doc.content}
            getHtml={() => editor?.getHTML() ?? ''}
          />

          {/* Share (owner only) */}
          {isOwner && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              onClick={() => setShareOpen(true)}
              sx={{ ml: 0.5 }}
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

      {canEdit && (
        <VersionHistoryDrawer
          docId={id!}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          currentContent={doc.content}
        />
      )}

      <CommentsPanel
        docId={id!}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </AppShell>
  );
}
