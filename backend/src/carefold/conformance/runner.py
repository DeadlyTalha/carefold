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

"""Conformance suite runner executing the 11-layer isolation test matrix (Step C2e)."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from carefold.conformance.layers import ALL_ISOLATION_LAYERS
from carefold.conformance.layers.base import BaseIsolationLayerTest
from carefold.conformance.models import ConformanceResult, IsolationLayer, LayerViolation
from carefold.conformance.protocol import ConformancePackProtocol
from carefold.db.models import Base, Profile, User
from carefold.db.scoped_session import ScopedAsyncSession
from carefold.memory.adapters.sqlite.memory_adapter import SqliteMemoryAdapter
from carefold.search.adapters.sqlite import SqliteSearchIndex


class ScopeConformanceRunner:
    """Manages isolated test infrastructure and executes 11-layer conformance tests across pack pairs."""

    def __init__(
        self,
        pack_a: ConformancePackProtocol,
        pack_b: ConformancePackProtocol,
        work_dir: Path,
    ) -> None:
        self.pack_a = pack_a
        self.pack_b = pack_b
        self.work_dir = work_dir
        self.cas_root = work_dir / "cas"
        self.kek: bytes = os.urandom(32)

        self._engine: Optional[Any] = None
        self._session_factory: Optional[async_sessionmaker[AsyncSession]] = None
        self.search_index: Optional[SqliteSearchIndex] = None
        self.memory_port: Optional[SqliteMemoryAdapter] = None

        self.user_id = f"user-{uuid.uuid4().hex[:8]}"
        self.profile_id = f"prof-{uuid.uuid4().hex[:8]}"

    @property
    def session_factory(self) -> async_sessionmaker[AsyncSession]:
        if self._session_factory is None:
            raise RuntimeError("ScopeConformanceRunner has not been set up. Call setup() first.")
        return self._session_factory

    async def setup(self) -> None:
        """Initializes isolated SQLite databases, CAS root, FTS5 index, and memory adapter."""
        self.work_dir.mkdir(parents=True, exist_ok=True)
        self.cas_root.mkdir(parents=True, exist_ok=True)

        db_path = self.work_dir / "conformance.db"
        self._engine = create_async_engine(
            f"sqlite+aiosqlite:///{db_path}",
            future=True,
        )

        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        self._session_factory = async_sessionmaker(
            self._engine,
            expire_on_commit=False,
            class_=ScopedAsyncSession,
        )

        # Seed test user and profile
        async with self._session_factory() as session:
            user = User(
                id=self.user_id,
                email=f"{self.user_id}@conformance.local",
                username=self.user_id,
                hashed_password="argon2id$conformance",
            )
            profile = Profile(
                id=self.profile_id,
                user_id=self.user_id,
                name="Conformance Test Profile",
                relationship="self",
                role="owner",
            )
            session.add_all([user, profile])
            await session.commit()

        # Initialize FTS5 index
        fts_path = self.work_dir / "fts.db"
        self.search_index = SqliteSearchIndex(db_path=str(fts_path))

        # Initialize Memory Adapter
        mem_path = self.work_dir / "memory.db"
        self.memory_port = SqliteMemoryAdapter(db_path=str(mem_path))

    async def teardown(self) -> None:
        """Disposes DB engines and closes open connections."""
        if self.search_index is not None:
            try:
                await self.search_index.close()
            except Exception:
                pass
            self.search_index = None
        if self.memory_port is not None:
            try:
                await self.memory_port.close()
            except Exception:
                pass
            self.memory_port = None
        if self._engine is not None:
            await self._engine.dispose()
            self._engine = None

    async def run_pair(
        self,
        pack_source: ConformancePackProtocol,
        pack_target: ConformancePackProtocol,
        layers: Optional[List[BaseIsolationLayerTest]] = None,
    ) -> ConformanceResult:
        """Executes layer tests verifying pack_source cannot observe or tamper with pack_target."""
        active_layers = layers or ALL_ISOLATION_LAYERS
        violations: List[LayerViolation] = []
        layer_results: Dict[IsolationLayer, bool] = {}

        for layer_test in active_layers:
            try:
                layer_violations = await layer_test.run(
                    runner=self,
                    pack_a=pack_source,
                    pack_b=pack_target,
                    profile_id=self.profile_id,
                    user_id=self.user_id,
                )
                if layer_violations:
                    violations.extend(layer_violations)
                    layer_results[layer_test.layer] = False
                else:
                    layer_results[layer_test.layer] = True
            except Exception as exc:
                violations.append(
                    LayerViolation(
                        layer=layer_test.layer,
                        source_pack=pack_source.pack_id,
                        target_pack=pack_target.pack_id,
                        target_scope=pack_target.owned_scopes[0],
                        operation="runner_execution",
                        details=f"Layer test raised unexpected exception: {exc}",
                    )
                )
                layer_results[layer_test.layer] = False

        return ConformanceResult(
            passed=len(violations) == 0,
            layer_results=layer_results,
            violations=violations,
            tested_pairs=[(pack_source.pack_id, pack_target.pack_id)],
        )

    async def run_full_matrix(self) -> ConformanceResult:
        """Executes full bidirectional matrix: (Pack A, Pack B) and (Pack B, Pack A)."""
        res_ab = await self.run_pair(self.pack_a, self.pack_b)
        res_ba = await self.run_pair(self.pack_b, self.pack_a)

        combined_violations = res_ab.violations + res_ba.violations
        combined_layers: Dict[IsolationLayer, bool] = {}

        for layer_enum in IsolationLayer:
            combined_layers[layer_enum] = (
                res_ab.layer_results.get(layer_enum, False)
                and res_ba.layer_results.get(layer_enum, False)
            )

        return ConformanceResult(
            passed=len(combined_violations) == 0,
            layer_results=combined_layers,
            violations=combined_violations,
            tested_pairs=res_ab.tested_pairs + res_ba.tested_pairs,
        )


__all__ = ["ScopeConformanceRunner"]
