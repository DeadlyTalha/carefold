"""Compatibility shim for carefold.tools.attach_read.

Re-exports execute_attach_read and attach_read_tool.
"""

from __future__ import annotations

from carefold.tools.attach_read import (
    ALLOWED_ATTACHMENT_EXTENSIONS,
    ALLOWED_TEXT_EXTS,
    MAX_FILE_SIZE,
    attach_read_tool,
    execute_attach_read,
    extract_text_from_pdf_bytes,
)

__all__ = [
    "ALLOWED_ATTACHMENT_EXTENSIONS",
    "ALLOWED_TEXT_EXTS",
    "MAX_FILE_SIZE",
    "attach_read_tool",
    "execute_attach_read",
    "extract_text_from_pdf_bytes",
]
