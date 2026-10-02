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

"""Carefold Safe Refusal Template externalized via ResourceLoader.

Sources safe refusal templates and disclaimer headers from disclaimers.yaml.
Zero hardcoded disclaimer texts or string literals embedded in Python code.
"""

from __future__ import annotations

from typing import Any
from carefold.resources.loader import get_resource_loader


def get_safe_refusal_template() -> str:
    """Retrieve the standard safe refusal template from disclaimers resource."""
    return get_resource_loader().get_safe_refusal_template()


def get_disclaimer_header_text() -> str:
    """Retrieve the standard disclaimer header text from disclaimers resource."""
    return get_resource_loader().get_disclaimer_header_text()


# Module-level backward-compatible variables populated at import time
_loader = get_resource_loader()
SAFE_REFUSAL_TEMPLATE: str = _loader.get_safe_refusal_template()
DISCLAIMER_HEADER_TEXT: str = _loader.get_disclaimer_header_text()

__all__ = [
    "SAFE_REFUSAL_TEMPLATE",
    "DISCLAIMER_HEADER_TEXT",
    "get_safe_refusal_template",
    "get_disclaimer_header_text",
]


def __getattr__(name: str) -> Any:
    """Dynamic attribute lookup for live resource updates or hot reloading."""
    if name == "SAFE_REFUSAL_TEMPLATE":
        return get_safe_refusal_template()
    if name == "DISCLAIMER_HEADER_TEXT":
        return get_disclaimer_header_text()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
