import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import TitleIcon from '@mui/icons-material/Title';
import { Box, Divider, MenuItem, Select, ToggleButton, Tooltip } from '@mui/material';
import type { Editor } from '@tiptap/react';
import React, { useCallback } from 'react';

interface Props {
  editor: Editor | null;
  readOnly?: boolean;
}

export const EditorToolbar = React.memo(function EditorToolbar({ editor, readOnly }: Props) {
  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(
    () => editor?.chain().focus().toggleUnderline().run(),
    [editor]
  );
  const toggleBullet = useCallback(
    () => editor?.chain().focus().toggleBulletList().run(),
    [editor]
  );
  const toggleOrdered = useCallback(
    () => editor?.chain().focus().toggleOrderedList().run(),
    [editor]
  );

  const headingLevel = editor?.isActive('heading', { level: 1 })
    ? 'h1'
    : editor?.isActive('heading', { level: 2 })
      ? 'h2'
      : editor?.isActive('heading', { level: 3 })
        ? 'h3'
        : 'paragraph';

  const setHeading = useCallback(
    (val: string) => {
      if (val === 'paragraph') {
        editor?.chain().focus().setParagraph().run();
      } else {
        const level = parseInt(val[1]) as 1 | 2 | 3;
        editor?.chain().focus().toggleHeading({ level }).run();
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
        opacity: readOnly ? 0.4 : 1,
        pointerEvents: readOnly ? 'none' : 'auto',
      }}
    >
      <Select
        value={headingLevel}
        onChange={(e) => setHeading(e.target.value)}
        size="small"
        sx={{ height: 32, minWidth: 120, fontSize: 13 }}
        startAdornment={<TitleIcon fontSize="small" sx={{ mr: 0.5 }} />}
      >
        <MenuItem value="paragraph">Normal text</MenuItem>
        <MenuItem value="h1">Heading 1</MenuItem>
        <MenuItem value="h2">Heading 2</MenuItem>
        <MenuItem value="h3">Heading 3</MenuItem>
      </Select>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Bold (⌘B)">
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onChange={toggleBold}
          size="small"
          sx={{ border: 'none', p: 0.5 }}
        >
          <FormatBoldIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Italic (⌘I)">
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onChange={toggleItalic}
          size="small"
          sx={{ border: 'none', p: 0.5 }}
        >
          <FormatItalicIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Underline (⌘U)">
        <ToggleButton
          value="underline"
          selected={editor.isActive('underline')}
          onChange={toggleUnderline}
          size="small"
          sx={{ border: 'none', p: 0.5 }}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Bullet list">
        <ToggleButton
          value="bullet"
          selected={editor.isActive('bulletList')}
          onChange={toggleBullet}
          size="small"
          sx={{ border: 'none', p: 0.5 }}
        >
          <FormatListBulletedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Numbered list">
        <ToggleButton
          value="ordered"
          selected={editor.isActive('orderedList')}
          onChange={toggleOrdered}
          size="small"
          sx={{ border: 'none', p: 0.5 }}
        >
          <FormatListNumberedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </Box>
  );
});
