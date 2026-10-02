# Hexagonal Ports Reference: MemoryPort & CatalogPort

Carefold decouples core workflow logic from physical database engines using the **Hexagonal Architecture (Ports and Adapters)** pattern.

Domain workflows communicate exclusively through abstract interfaces (`MemoryPort` and `CatalogPort`), while concrete adapters encapsulate database queries, schema migrations, and concurrency controls.

---

## 1. `MemoryPort` Interface

Defined in `backend/src/carefold/memory/ports/memory_port.py`:

```python
class MemoryPort(ABC):
    @abstractmethod
    async def remember(
        self,
        key: str,
        value: Any,
        tier: MemoryTier,
        namespace: str = "default",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Stores or updates a memory record in the specified namespace and tier."""
        ...

    @abstractmethod
    async def recall(
        self,
        query: str,
        tier: Optional[MemoryTier] = None,
        namespace: str = "default",
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Recalls memory records ordered by relevance and salience descending."""
        ...

    @abstractmethod
    async def forget(self, key: str, namespace: str = "default") -> bool:
        """Deletes a memory record identified by key in the namespace."""
        ...

    @abstractmethod
    async def reinforce(
        self,
        key: str,
        namespace: str = "default",
        delta: float = 0.1,
    ) -> None:
        """Adjusts the salience / retrieval weight of a memory record."""
        ...

    async def close(self) -> None:
        """Releases underlying connections and resources."""
        pass
```

---

## 2. `CatalogPort` Interface

Defined in `backend/src/carefold/memory/ports/catalog_port.py`:

```python
class CatalogPort(ABC):
    @abstractmethod
    async def index_agent(self, manifest: AgentManifest) -> None:
        """Indexes or updates an agent manifest in the catalog."""
        ...

    @abstractmethod
    async def index_skill(self, manifest: SkillManifest) -> None:
        """Indexes or updates a skill manifest in the catalog."""
        ...

    @abstractmethod
    async def search_agents(
        self,
        query: Optional[str] = None,
        domain: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[AgentManifest]:
        """Searches and filters indexed agents using FTS5 and taxonomy filters."""
        ...

    @abstractmethod
    async def search_skills(
        self,
        query: Optional[str] = None,
        domain: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[SkillManifest]:
        """Searches and filters indexed skills."""
        ...

    @abstractmethod
    async def get_category_tree(self) -> Dict[str, Any]:
        """Builds a hierarchical category tree with agent counts across domains."""
        ...

    async def close(self) -> None:
        """Releases underlying catalog resources."""
        pass
```

---

## 3. SQLite Adapters with FTS5

Carefold provides zero-dependency local implementations using `aiosqlite` and SQLite Full-Text Search 5 (FTS5).

### `SqliteMemoryAdapter` Schema
Defined in `backend/src/carefold/memory/adapters/sqlite/memory_adapter.py`:

```sql
-- Relational metadata table
CREATE TABLE IF NOT EXISTS memories (
    id TEXT NOT NULL,
    key TEXT NOT NULL,
    namespace TEXT NOT NULL,
    tier TEXT NOT NULL,
    value TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    salience REAL NOT NULL DEFAULT 1.0,
    access_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_accessed_at TEXT,
    PRIMARY KEY (namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_memories_id ON memories(id);
CREATE INDEX IF NOT EXISTS idx_memories_ns_tier ON memories(namespace, tier);
CREATE INDEX IF NOT EXISTS idx_memories_ns_key ON memories(namespace, key);
CREATE INDEX IF NOT EXISTS idx_memories_ns_salience ON memories(namespace, salience DESC);

-- FTS5 full-text virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
    id UNINDEXED,
    namespace UNINDEXED,
    content,
    tokenize = 'porter unicode61'
);
```

### `SqliteCatalogAdapter` Schema
Defined in `backend/src/carefold/memory/adapters/sqlite/catalog_adapter.py`:

```sql
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '0.1.0',
    domain TEXT NOT NULL DEFAULT 'wellness',
    category TEXT NOT NULL DEFAULT '',
    risk_class TEXT NOT NULL DEFAULT 'wellness',
    tags TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL DEFAULT '',
    hidden INTEGER NOT NULL DEFAULT 0,
    manifest_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS agents_fts USING fts5(
    id UNINDEXED,
    title,
    description,
    tags,
    category,
    content,
    tokenize = 'porter unicode61'
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    manifest_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
    id UNINDEXED,
    name,
    description,
    tags,
    category,
    instructions,
    tokenize = 'porter unicode61'
);
```

---

## 4. Concurrency & Locking Resiliency

SQLite databases can encounter `database is locked` or `busy` errors during concurrent asynchronous writes. Carefold guarantees transactional reliability via:

1. **Write-Ahead Logging (WAL)**: `PRAGMA journal_mode = WAL;` enables concurrent reads alongside active writes.
2. **Busy Timeout**: `PRAGMA busy_timeout = 10000;` (`SQLITE_BUSY_TIMEOUT_MS = 10000`) instructs SQLite to wait up to 10 seconds before returning busy.
3. **Exponential Backoff Retry**: `_run_write_with_retry` automatically catches `OperationalError`, rolls back the active transaction, and retries up to 10 attempts with exponential jitter.

---

## 5. Factory & Dependency Injection

The `carefold.memory.factory` module dynamically instantiates adapters based on configuration:

```python
from carefold.memory.factory import get_memory_port, get_catalog_port

# Resolves shared singleton instances configured via CAREFOLD_MEMORY_BACKEND
memory_port = get_memory_port()
catalog_port = get_catalog_port()
```

If an unsupported backend or unimplemented roadmap adapter (e.g. `spector` or `postgres`) is requested, the factory raises an informative `NotImplementedError` directing the operator to use `sqlite`.
