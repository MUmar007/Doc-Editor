import { Box, InputBase } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface Props {
  title: string;
  onRename: (title: string) => void;
  readOnly?: boolean;
}

export function DocumentRename({ title, onRename, readOnly }: Props) {
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const handleBlur = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setValue(title);
    }
  };

  return (
    <Box sx={{ flex: 1, mx: 2 }}>
      <InputBase
        inputRef={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') inputRef.current?.blur();
          if (e.key === 'Escape') {
            setValue(title);
            inputRef.current?.blur();
          }
        }}
        disabled={readOnly}
        inputProps={{ 'aria-label': 'Document title' }}
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'text.primary',
          width: '100%',
          '& input': { p: 0 },
          '&:hover input': { borderBottom: readOnly ? 'none' : '1px solid rgba(255,255,255,0.2)' },
          '& input:focus': { borderBottom: '1px solid', borderColor: 'primary.main' },
        }}
      />
    </Box>
  );
}
