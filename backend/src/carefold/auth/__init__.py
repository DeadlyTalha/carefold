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

"""Authentication subsystem providing hexagonal AuthPort and swappable adapters."""

from __future__ import annotations

import sys
from typing import Any

import yarvelle_core.auth as _target_module
import yarvelle_core.auth.adapters as _adapters
import yarvelle_core.auth.adapters.disabled_adapter as _disabled
import yarvelle_core.auth.adapters.oidc_adapter as _oidc
import yarvelle_core.auth.adapters.sql_adapter as _sql
import yarvelle_core.auth.factory as _factory
import yarvelle_core.auth.ports as _ports

sys.modules[__name__] = _target_module
sys.modules["carefold.auth"] = _target_module
sys.modules["carefold.auth.ports"] = _ports
sys.modules["carefold.auth.factory"] = _factory
sys.modules["carefold.auth.adapters"] = _adapters
sys.modules["carefold.auth.adapters.disabled_adapter"] = _disabled
sys.modules["carefold.auth.adapters.oidc_adapter"] = _oidc
sys.modules["carefold.auth.adapters.sql_adapter"] = _sql

from yarvelle_core.auth import *  # noqa: F401, F403


def __getattr__(name: str) -> Any:
    return getattr(_target_module, name)


def __dir__() -> list[str]:
    return sorted(set(globals().keys()) | set(dir(_target_module)))
