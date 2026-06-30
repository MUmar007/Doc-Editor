import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadDocument } from '../../hooks/useDocuments';

interface Props {
  trigger: React.ReactElement<{ onClick?: () => void }>;
  onSuccess?: () => void;
}

export function FileUpload({ trigger, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();
  const navigate = useNavigate();

  const handleClick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const doc = await upload.mutateAsync(file);
      navigate(`/docs/${doc.id}`);
      onSuccess?.();
    } catch {
      // error surfaced via upload.isError in parent
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.docx"
        style={{ display: 'none' }}
        onChange={handleChange}
        aria-label="Upload document file"
      />
      {React.cloneElement(trigger, { onClick: handleClick })}
    </>
  );
}
