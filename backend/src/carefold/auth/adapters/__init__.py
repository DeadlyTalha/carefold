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

"""Authentication adapter implementations for Carefold."""

from __future__ import annotations

import sys
from typing import Any

import yarvelle_core.auth.adapters as _target_module
import yarvelle_core.auth.adapters.disabled_adapter as _disabled
import yarvelle_core.auth.adapters.oidc_adapter as _oidc
import yarvelle_core.auth.adapters.sql_adapter as _sql

sys.modules[__name__] = _target_module
sys.modules["carefold.auth.adapters"] = _target_module
sys.modules["carefold.auth.adapters.disabled_adapter"] = _disabled
sys.modules["carefold.auth.adapters.oidc_adapter"] = _oidc
sys.modules["carefold.auth.adapters.sql_adapter"] = _sql

from yarvelle_core.auth.adapters import *  # noqa: F401, F403


def __getattr__(name: str) -> Any:
    return getattr(_target_module, name)


def __dir__() -> list[str]:
    return sorted(set(globals().keys()) | set(dir(_target_module)))
