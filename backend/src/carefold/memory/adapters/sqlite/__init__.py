"""SQLite adapter package implementing MemoryPort and CatalogPort."""

from __future__ import annotations

from carefold.memory.adapters.sqlite.catalog_adapter import (
    CANONICAL_DOMAINS,
    SqliteCatalogAdapter,
    build_category_tree_from_rows,
    sanitize_fts_query,
)
from carefold.memory.adapters.sqlite.memory_adapter import SqliteMemoryAdapter

__all__ = [
    "SqliteMemoryAdapter",
    "SqliteCatalogAdapter",
    "sanitize_fts_query",
    "build_category_tree_from_rows",
    "CANONICAL_DOMAINS",
]
