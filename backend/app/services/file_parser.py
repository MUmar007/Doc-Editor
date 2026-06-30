from pathlib import Path
from typing import Any

from app.exceptions import ValidationError

ALLOWED_EXTENSIONS = {".txt", ".md", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

TiptapNode = dict[str, Any]


def _text_node(text: str, marks: list[dict[str, str]] | None = None) -> TiptapNode:
    node: TiptapNode = {"type": "text", "text": text}
    if marks:
        node["marks"] = marks
    return node


def _paragraph(*children: TiptapNode) -> TiptapNode:
    return {"type": "paragraph", "content": list(children)} if children else {"type": "paragraph"}


def _heading(level: int, text: str) -> TiptapNode:
    return {
        "type": "heading",
        "attrs": {"level": level},
        "content": [_text_node(text)],
    }


def _bullet_list(items: list[list[TiptapNode]]) -> TiptapNode:
    return {
        "type": "bulletList",
        "content": [
            {"type": "listItem", "content": [{"type": "paragraph", "content": item}]}
            for item in items
        ],
    }


def _parse_txt(content: bytes) -> list[TiptapNode]:
    text = content.decode("utf-8", errors="replace")
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    return [_paragraph(_text_node(p)) for p in paragraphs] or [_paragraph()]


def _parse_md(content: bytes) -> list[TiptapNode]:
    from markdown_it import MarkdownIt

    md = MarkdownIt()
    tokens = md.parse(content.decode("utf-8", errors="replace"))
    nodes: list[TiptapNode] = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok.type == "heading_open":
            level = int(tok.tag[1])
            inline = tokens[i + 1] if i + 1 < len(tokens) else None
            text = inline.content if inline else ""
            nodes.append(_heading(level, text))
            i += 3
        elif tok.type == "paragraph_open":
            inline = tokens[i + 1] if i + 1 < len(tokens) else None
            text = inline.content if inline else ""
            nodes.append(_paragraph(_text_node(text)))
            i += 3
        elif tok.type == "bullet_list_open":
            items: list[list[TiptapNode]] = []
            i += 1
            while i < len(tokens) and tokens[i].type != "bullet_list_close":
                if tokens[i].type == "list_item_open":
                    i += 1
                    while i < len(tokens) and tokens[i].type != "list_item_close":
                        if tokens[i].type == "inline":
                            items.append([_text_node(tokens[i].content)])
                        i += 1
                i += 1
            nodes.append(_bullet_list(items))
            i += 1
        else:
            i += 1

    return nodes or [_paragraph()]


def _parse_docx(content: bytes) -> list[TiptapNode]:
    import io

    from docx import Document as DocxDocument

    doc = DocxDocument(io.BytesIO(content))
    nodes: list[TiptapNode] = []

    heading_styles = {
        "Heading 1": 1,
        "Heading 2": 2,
        "Heading 3": 3,
        "Title": 1,
        "Subtitle": 2,
    }

    for para in doc.paragraphs:
        if not para.text.strip():
            continue
        style_name = para.style.name if para.style else "Normal"
        if style_name in heading_styles:
            nodes.append(_heading(heading_styles[style_name], para.text.strip()))
        else:
            children: list[TiptapNode] = []
            for run in para.runs:
                if not run.text:
                    continue
                marks = []
                if run.bold:
                    marks.append({"type": "bold"})
                if run.italic:
                    marks.append({"type": "italic"})
                if run.underline:
                    marks.append({"type": "underline"})
                children.append(_text_node(run.text, marks or None))
            if children:
                nodes.append(_paragraph(*children))
            else:
                nodes.append(_paragraph(_text_node(para.text)))

    return nodes or [_paragraph()]


def validate_upload(filename: str | None, size: int | None) -> None:
    ext = Path(filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file type '{ext}'. Allowed types: .txt, .md, .docx"
        )
    if size and size > MAX_FILE_SIZE:
        raise ValidationError("File size exceeds the 5 MB limit")


def parse_file(filename: str, content: bytes) -> dict[str, Any]:
    ext = Path(filename).suffix.lower()
    if ext == ".txt":
        nodes = _parse_txt(content)
    elif ext == ".md":
        nodes = _parse_md(content)
    elif ext == ".docx":
        nodes = _parse_docx(content)
    else:
        raise ValidationError(f"Unsupported file type: {ext}")

    return {"type": "doc", "content": nodes}
