# Carefold — Healthcare AI Agent Marketplace & Runtime
# Copyright 2026 Spectrayan (https://spectrayan.com)
#
# Licensed under the PolyForm Noncommercial License 1.0.0 and the
# Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
# Personal and household local use only. Commercial use, hosted service
# offering, rebranding, white-labeling, and redistribution of modified
# forks are prohibited without a written commercial license from Spectrayan.
#
# Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)

"""Carefold health tools and ToolSpec definitions."""

from __future__ import annotations

from typing import List

try:
    from carefold.engine.tool_registry import ToolSpec, _make_health_builtin_specs
except ImportError:
    from yarvelle_core.engine.tool_registry import ToolSpec, _make_health_builtin_specs


def get_health_tool_specs() -> List[ToolSpec]:
    """Returns the 17 clinical and health ToolSpecs."""
    return _make_health_builtin_specs()


__all__ = [
    "get_health_tool_specs",
]
