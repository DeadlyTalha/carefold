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

"""Milestone 2 Step C2e Conformance Suite: 11-Layer Scope Isolation Verification.

Verifies zero cross-pack data leakage between health and synthetic test_finance:
1. ORM / ScopedSession
2. CAS Storage
3. FTS5 Search
4. Memory Namespaces
5. Vault HKDF Sub-Keys
6. ToolExecutionGate
7. LLM Prompt Context
8. API Routing & Middleware
9. SSE Streaming & Dossier Export
10. Audit Log Tagging & Chaining
11. Multi-Scope PII Redaction
"""

from __future__ import annotations

from pathlib import Path
import pytest
import pytest_asyncio

from carefold.conformance.fixtures.health_fixture import HealthPackFixture
from carefold.conformance.fixtures.synthetic_finance import SyntheticFinancePackFixture
from carefold.conformance.layers import (
    Layer01OrmTest,
    Layer02CasTest,
    Layer03Fts5Test,
    Layer04MemoryTest,
    Layer05VaultTest,
    Layer06ToolGateTest,
    Layer07PromptTest,
    Layer08ApiTest,
    Layer09ExportTest,
    Layer10AuditTest,
    Layer11RedactionTest,
)
from carefold.conformance.models import IsolationLayer
from carefold.conformance.runner import ScopeConformanceRunner


@pytest.fixture
async def conformance_env(tmp_path: Path):
    """Sets up an isolated runner with in-memory SQLite, partitioned CAS root, and mock packs."""
    runner = ScopeConformanceRunner(
        pack_a=HealthPackFixture(),
        pack_b=SyntheticFinancePackFixture(),
        work_dir=tmp_path / "conformance",
    )
    await runner.setup()
    try:
        yield runner
    finally:
        await runner.teardown()


@pytest.mark.asyncio
async def test_scope_conformance_full_11_layers_matrix(conformance_env: ScopeConformanceRunner):
    """Executes the full 11-layer isolation matrix across both bidirectional pack pairs."""
    result = await conformance_env.run_full_matrix()
    assert result.passed is True, f"Conformance violations detected: {result.violations}"
    assert len(result.violations) == 0
    for layer in IsolationLayer:
        assert result.layer_results.get(layer) is True, f"Layer {layer.value} failed conformance test"


@pytest.mark.asyncio
async def test_conformance_layer_01_orm(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer01OrmTest()])
    assert res.passed is True, f"Layer 1 ORM violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_02_cas(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer02CasTest()])
    assert res.passed is True, f"Layer 2 CAS violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_03_fts5(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer03Fts5Test()])
    assert res.passed is True, f"Layer 3 FTS5 violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_04_memory(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer04MemoryTest()])
    assert res.passed is True, f"Layer 4 Memory violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_05_vault(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer05VaultTest()])
    assert res.passed is True, f"Layer 5 Vault violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_06_tool_gate(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer06ToolGateTest()])
    assert res.passed is True, f"Layer 6 Tool Gate violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_07_prompt(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer07PromptTest()])
    assert res.passed is True, f"Layer 7 Prompt violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_08_api(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer08ApiTest()])
    assert res.passed is True, f"Layer 8 API violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_09_export(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer09ExportTest()])
    assert res.passed is True, f"Layer 9 Export violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_10_audit(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer10AuditTest()])
    assert res.passed is True, f"Layer 10 Audit violations: {res.violations}"


@pytest.mark.asyncio
async def test_conformance_layer_11_redaction(conformance_env: ScopeConformanceRunner):
    res = await conformance_env.run_pair(conformance_env.pack_a, conformance_env.pack_b, [Layer11RedactionTest()])
    assert res.passed is True, f"Layer 11 Redaction violations: {res.violations}"
