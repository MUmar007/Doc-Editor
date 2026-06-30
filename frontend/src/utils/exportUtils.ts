import type { TiptapContent } from '../types';

type TiptapNode = {
  type: string;
  text?: string;
  content?: TiptapNode[];
  marks?: { type: string }[];
  attrs?: Record<string, unknown>;
};

function nodeToMd(node: TiptapNode, listDepth = 0, listIndex = 0): string {
  const children = node.content ?? [];

  switch (node.type) {
    case 'doc':
      return children.map((c) => nodeToMd(c)).join('');

    case 'paragraph':
      if (children.length === 0) return '\n';
      return children.map((c) => nodeToMd(c)).join('') + '\n\n';

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      return '#'.repeat(level) + ' ' + children.map((c) => nodeToMd(c)).join('') + '\n\n';
    }

    case 'bulletList':
      return children.map((c) => nodeToMd(c, listDepth, 0)).join('') + '\n';

    case 'orderedList':
      return children.map((c, i) => nodeToMd(c, listDepth, i + 1)).join('') + '\n';

    case 'listItem': {
      const indent = '  '.repeat(listDepth);
      const bullet = listIndex === 0 ? `${indent}- ` : `${indent}${listIndex}. `;
      const content = children
        .map((c) => {
          if (c.type === 'bulletList' || c.type === 'orderedList') {
            return '\n' + nodeToMd(c, listDepth + 1, 0);
          }
          return nodeToMd(c, listDepth, listIndex).replace(/\n\n$/, '');
        })
        .join('');
      return bullet + content + '\n';
    }

    case 'text': {
      let text = node.text ?? '';
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') text = `**${text}**`;
        else if (mark.type === 'italic') text = `*${text}*`;
        else if (mark.type === 'underline') text = `<u>${text}</u>`;
        else if (mark.type === 'strike') text = `~~${text}~~`;
        else if (mark.type === 'code') text = `\`${text}\``;
      }
      return text;
    }

    case 'hardBreak':
      return '\n';

    default:
      return children.map((c) => nodeToMd(c)).join('');
  }
}

export function tiptapToMarkdown(content: TiptapContent): string {
  return nodeToMd(content as TiptapNode).trim();
}

export function downloadMarkdown(title: string, content: TiptapContent): void {
  const md = tiptapToMarkdown(content);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printAsPDF(title: string, html: string): void {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Georgia, serif; margin: 2cm; font-size: 12pt; line-height: 1.7; color: #000; }
    h1 { font-size: 2em; font-weight: 700; margin: 0.75em 0 0.4em; }
    h2 { font-size: 1.5em; font-weight: 600; margin: 0.6em 0 0.3em; }
    h3 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0 0.25em; }
    p  { margin: 0.4em 0; }
    ul, ol { padding-left: 1.5em; margin: 0.4em 0; }
    li { margin: 0.2em 0; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    u  { text-decoration: underline; }
  </style>
</head>
<body>${html}</body>
</html>`);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}
