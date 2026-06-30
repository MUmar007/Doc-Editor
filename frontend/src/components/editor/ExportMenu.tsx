import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';
import type { TiptapContent } from '../../types';
import { downloadMarkdown, printAsPDF } from '../../utils/exportUtils';

interface Props {
  title: string;
  content: TiptapContent;
  getHtml: () => string;
}

export function ExportMenu({ title, content, getHtml }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="Export">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem
          onClick={() => {
            downloadMarkdown(title, content);
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export as Markdown" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            printAsPDF(title, getHtml());
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Print / Save as PDF" />
        </MenuItem>
      </Menu>
    </>
  );
}
