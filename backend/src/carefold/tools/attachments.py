# Carefold — Healthcare AI Agent Marketplace & Runtime
# Copyright 2026 Spectrayan
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
