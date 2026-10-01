"""Hexagonal memory and catalog architecture for Carefold.

Exports port interfaces (MemoryPort, CatalogPort, MemoryTier), concrete SQLite adapters
(SqliteMemoryAdapter, SqliteCatalogAdapter), and dynamic factory functions for cognitive
agent memory and catalog indexing.
"""

from carefold.memory.adapters.sqlite import (
    SqliteCatalogAdapter,
    SqliteMemoryAdapter,
)
from carefold.memory.factory import (
    create_catalog_port,
    create_memory_port,
    get_catalog_port,
    get_memory_port,
    reset_memory_ports,
    set_catalog_port,
    set_memory_port,
)
from carefold.memory.ports import (
    CatalogPort,
    MemoryPort,
    MemoryTier,
)

__all__ = [
    "CatalogPort",
    "MemoryPort",
    "MemoryTier",
    "SqliteCatalogAdapter",
    "SqliteMemoryAdapter",
    "create_catalog_port",
    "create_memory_port",
    "get_catalog_port",
    "get_memory_port",
    "reset_memory_ports",
    "set_catalog_port",
    "set_memory_port",
]
