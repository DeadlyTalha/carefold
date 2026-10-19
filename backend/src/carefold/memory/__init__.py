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

"""Backward-compatibility re-export shim for yarvelle_core.memory."""

from __future__ import annotations

import sys
from typing import Any

import yarvelle_core.memory as _target_module
import yarvelle_core.memory.adapters as _adapters
import yarvelle_core.memory.adapters.spector as _spector
import yarvelle_core.memory.adapters.spector.memory_adapter as _spector_mem
import yarvelle_core.memory.adapters.spector.store as _spector_store
import yarvelle_core.memory.adapters.sqlite as _sqlite
import yarvelle_core.memory.adapters.sqlite.catalog_adapter as _sqlite_cat
import yarvelle_core.memory.adapters.sqlite.memory_adapter as _sqlite_mem
import yarvelle_core.memory.factory as _factory
import yarvelle_core.memory.namespace as _namespace
import yarvelle_core.memory.ports as _ports
import yarvelle_core.memory.ports.catalog_port as _cat_port
import yarvelle_core.memory.ports.memory_port as _mem_port

sys.modules[__name__] = _target_module
sys.modules["carefold.memory"] = _target_module
sys.modules["carefold.memory.factory"] = _factory
sys.modules["carefold.memory.namespace"] = _namespace
sys.modules["carefold.memory.ports"] = _ports
sys.modules["carefold.memory.ports.catalog_port"] = _cat_port
sys.modules["carefold.memory.ports.memory_port"] = _mem_port
sys.modules["carefold.memory.adapters"] = _adapters
sys.modules["carefold.memory.adapters.spector"] = _spector
sys.modules["carefold.memory.adapters.spector.memory_adapter"] = _spector_mem
sys.modules["carefold.memory.adapters.spector.store"] = _spector_store
sys.modules["carefold.memory.adapters.sqlite"] = _sqlite
sys.modules["carefold.memory.adapters.sqlite.catalog_adapter"] = _sqlite_cat
sys.modules["carefold.memory.adapters.sqlite.memory_adapter"] = _sqlite_mem

from yarvelle_core.memory import *  # noqa: F401, F403


def __getattr__(name: str) -> Any:
    return getattr(_target_module, name)


def __dir__() -> list[str]:
    return sorted(set(globals().keys()) | set(dir(_target_module)))
