"""Carefold resources package.

Provides external YAML schemas and ResourceLoader for:
- disclaimers.yaml
- refusal_patterns.yaml
- prompts.yaml
- errors.yaml
"""

from carefold.resources.loader import (
    RefusalPattern,
    ResourceLoader,
    get_resource_loader,
)

__all__ = [
    "RefusalPattern",
    "ResourceLoader",
    "get_resource_loader",
]
