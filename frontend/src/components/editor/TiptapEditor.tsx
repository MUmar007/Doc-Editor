import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import type { TiptapContent } from '../../types';
import './tiptap.css';

interface Props {
  content: TiptapContent;
  onUpdate: (content: TiptapContent) => void;
  editable?: boolean;
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
}

export function TiptapEditor({ content, onUpdate, editable = true, onEditorReady }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start typing your document…' }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON() as TiptapContent);
    },
  });

  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Sync content from server when it changes externally (initial load)
  useEffect(() => {
    if (editor && !editor.isDestroyed && content) {
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = JSON.stringify(content);
      if (currentJson !== newJson) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  return <EditorContent editor={editor} className="tiptap-wrapper" />;
}
