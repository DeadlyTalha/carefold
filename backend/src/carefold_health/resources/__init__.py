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

"""Carefold Health Pack Resources Package.

Provides external clinical YAML resources and ResourceLoader for:
- refusal_patterns.yaml
- disclaimers.yaml
- vitals_thresholds.yaml
- routing_patterns.yaml
- prompts/
"""

from carefold_health.resources.loader import (
    HealthResourceLoader,
    RefusalPattern,
    ResourceLoader,
    get_health_resource_loader,
    get_health_resources_dir,
    get_resource_loader,
)

__all__ = [
    "HealthResourceLoader",
    "ResourceLoader",
    "RefusalPattern",
    "get_health_resources_dir",
    "get_health_resource_loader",
    "get_resource_loader",
]
