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

"""Backward-compatibility re-export shim for yarvelle_core.engine.tool_exec."""

from __future__ import annotations

import sys
from typing import Any

from yarvelle_core.engine.tool_exec import *  # noqa: F401, F403
import yarvelle_core.engine.tool_exec as _target_module
from yarvelle_core.connectors.base import (
    ToolContext as _ConnectorToolContext,
    ToolSpec as _ConnectorToolSpec,
)

_target_module.ConnectorToolContext = _ConnectorToolContext
_target_module.ConnectorToolSpec = _ConnectorToolSpec

sys.modules[__name__] = _target_module


def __getattr__(name: str) -> Any:
    return getattr(_target_module, name)


def __dir__() -> list[str]:
    return sorted(set(globals().keys()) | set(dir(_target_module)))
