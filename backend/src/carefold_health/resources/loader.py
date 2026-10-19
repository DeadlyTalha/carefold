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

"""Carefold Health Pack Resource Loader.

Resolves and loads health-pack specific YAML resources:
- refusal_patterns.yaml: 34 clinical safety regex patterns, vocabularies, and building blocks.
- disclaimers.yaml: Healthcare disclaimers, intended-use notices, and safe refusal template.
- vitals_thresholds.yaml: Hypertensive crisis, hypoxemia, hypoglycemia physiological thresholds.
- routing_patterns.yaml: Health specialist agent routing patterns.
- prompts/: Safety preambles and clinical prompts.

Supports both development layouts (editable installs, repo checkout) and packaged
installations (wheels via importlib.resources). Gracefully falls back to yarvelle_core
for domain-neutral resources (e.g., errors.yaml, db_tools.yaml).
"""

from __future__ import annotations

import importlib.resources
import logging
from pathlib import Path
import threading
from typing import Any, Dict, Optional

from yarvelle_core.resources.loader import (
    RefusalPattern,
    ResourceLoader,
    get_resource_loader as get_core_resource_loader,
)

logger = logging.getLogger("carefold_health.resources")


def get_health_resources_dir() -> Path:
    """Resolves the health pack resources directory across development and packaged environments.

    Search order:
    1. importlib.resources within carefold_health package (wheel / installed distribution)
    2. Co-located resources directory next to this module (src/carefold_health/resources)
    3. Pack root resources directory in repository layout (packs/health/resources)
    4. Sibling carefold backend resources directory (Carefold monorepo development fallback)
    5. CWD-relative packs/health/resources (CLI / script invocation fallback)

    Raises:
        FileNotFoundError: If no valid health resources directory with refusal_patterns.yaml is found.
    """
    # 1. importlib.resources (Python 3.9+ traversable)
    try:
        ref = importlib.resources.files("carefold_health") / "resources"
        candidate = Path(str(ref)).resolve()
        if candidate.is_dir() and (candidate / "refusal_patterns.yaml").is_file():
            return candidate
    except Exception as err:
        logger.debug("importlib.resources resolution failed: %s", err)

    # 2. Co-located directory next to this file (src/carefold_health/resources)
    co_located = Path(__file__).resolve().parent
    if co_located.is_dir() and (co_located / "refusal_patterns.yaml").is_file():
        return co_located

    # 3. Repository pack layout: from src/carefold_health/resources/loader.py -> parents[3] is packs/health
    repo_pack_dir = Path(__file__).resolve().parents[3] / "resources"
    if repo_pack_dir.is_dir() and (repo_pack_dir / "refusal_patterns.yaml").is_file():
        return repo_pack_dir

    # 4. Carefold monorepo backend fallback: backend/src/carefold/resources
    monorepo_carefold = Path.cwd() / "backend" / "src" / "carefold" / "resources"
    if monorepo_carefold.is_dir() and (monorepo_carefold / "refusal_patterns.yaml").is_file():
        return monorepo_carefold

    # 5. CWD-relative pack directory: packs/health/resources
    cwd_pack_dir = Path.cwd() / "packs" / "health" / "resources"
    if cwd_pack_dir.is_dir() and (cwd_pack_dir / "refusal_patterns.yaml").is_file():
        return cwd_pack_dir

    raise FileNotFoundError(
        "Could not resolve carefold_health resources directory containing refusal_patterns.yaml. "
        f"Searched: importlib.resources, {co_located}, {repo_pack_dir}, {monorepo_carefold}, {cwd_pack_dir}"
    )


class HealthResourceLoader(ResourceLoader):
    """Resource loader for the Carefold Health Pack.

    Extends yarvelle_core.resources.loader.ResourceLoader by binding to the
    health pack resources directory, while delegating missing domain-neutral
    resources (e.g. errors.yaml) to the core loader fallback.
    """

    def __init__(
        self,
        resources_dir: Optional[Path] = None,
        fallback_loader: Optional[ResourceLoader] = None,
    ) -> None:
        target_dir = resources_dir or get_health_resources_dir()
        super().__init__(resources_dir=target_dir)
        self._fallback_loader = fallback_loader

    def load_yaml(self, filename: str) -> Dict[str, Any]:
        """Loads YAML resource, falling back to core loader if not present in health pack."""
        try:
            return super().load_yaml(filename)
        except (FileNotFoundError, PermissionError):
            if self._fallback_loader:
                return self._fallback_loader.load_yaml(filename)
            raise


_LOADER_LOCK = threading.Lock()
_LOADER_INSTANCE: Optional[HealthResourceLoader] = None


def get_health_resource_loader() -> HealthResourceLoader:
    """Returns the cached singleton HealthResourceLoader instance.

    Thread-safe implementation using double-checked locking with a
    threading.Lock to guarantee singleton identity under concurrent cold-start.
    """
    global _LOADER_INSTANCE
    if _LOADER_INSTANCE is None:
        with _LOADER_LOCK:
            if _LOADER_INSTANCE is None:
                core_fallback = get_core_resource_loader()
                _LOADER_INSTANCE = HealthResourceLoader(
                    resources_dir=get_health_resources_dir(),
                    fallback_loader=core_fallback,
                )
    return _LOADER_INSTANCE


# Alias for seamless drop-in replacement
get_resource_loader = get_health_resource_loader

__all__ = [
    "HealthResourceLoader",
    "ResourceLoader",
    "RefusalPattern",
    "get_health_resources_dir",
    "get_health_resource_loader",
    "get_resource_loader",
]
