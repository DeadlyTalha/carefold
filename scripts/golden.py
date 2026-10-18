#!/usr/bin/env python3
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

"""Golden Snapshot Generator and Verifier for Carefold Baseline Gates (G1, G4, G5, G6, G7).

Usage:
    python scripts/golden.py          # Generate/update snapshots in tests/golden/
    python scripts/golden.py --verify # Verify current runtime matches snapshots byte-for-byte
    python scripts/golden.py --check [target] # Verify specific target (openapi, prompts, etc.)
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import Dict, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_SRC = REPO_ROOT / "backend" / "src"
LIBS_CONNECTORS = REPO_ROOT / "libs" / "connectors"

sys.path.insert(0, str(BACKEND_SRC))
sys.path.insert(0, str(LIBS_CONNECTORS))

GOLDEN_DIR = REPO_ROOT / "tests" / "golden"


class PytestNodeCollector:
    """Pytest plugin collecting item node IDs in collection order."""

    def __init__(self) -> None:
        self.node_ids: List[str] = []

    def pytest_collection_modifyitems(self, session, config, items) -> None:
        self.node_ids = [item.nodeid for item in items]


def collect_pytest_node_ids() -> str:
    """G1: Collects all test node IDs from backend/tests/."""
    import pytest

    collector = PytestNodeCollector()
    ret = pytest.main(
        [str(REPO_ROOT / "backend" / "tests"), "--collect-only", "-q", "-s", "-o", "addopts="],
        plugins=[collector],
    )
    import logging
    for handler in list(logging.root.handlers):
        logging.root.removeHandler(handler)
    logging.basicConfig(stream=sys.stderr)
    if ret != 0:
        raise RuntimeError(f"Pytest collection failed with exit code {ret}")
    return "\n".join(collector.node_ids) + "\n"


def generate_openapi_json() -> str:
    """G4: Generates deterministic canonical /api/v1 OpenAPI 3.1.0 JSON."""
    from carefold.main import create_app

    app = create_app()
    schema = app.openapi()
    return json.dumps(schema, indent=2, sort_keys=True) + "\n"


def canonical_schema(raw_sql: str) -> str:
    """Normalizes SQLite DDL to be 100% deterministic across SQLAlchemy set-reflection variations."""
    import re

    raw_statements = [s.strip() for s in re.split(r";\s*\n", raw_sql) if s.strip()]

    tables = {}
    indexes = {}
    table_order = []

    for stmt in raw_statements:
        if stmt.startswith("CREATE TABLE"):
            m = re.match(r"CREATE TABLE (\S+)\s*\((.*)\)", stmt, re.DOTALL)
            if m:
                tbl_name = m.group(1).strip()
                body = m.group(2)
                lines = [l.strip().rstrip(",") for l in body.splitlines() if l.strip()]
                cols = []
                constraints = []
                for l in lines:
                    if l.startswith("FOREIGN KEY") or l.startswith("CONSTRAINT") or l.startswith("PRIMARY KEY"):
                        constraints.append(l)
                    else:
                        cols.append(l)
                constraints.sort()
                body_formatted = ",\n\t".join(cols + constraints)
                tables[tbl_name] = f"CREATE TABLE {tbl_name} (\n\t{body_formatted}\n);"
                if tbl_name not in table_order:
                    table_order.append(tbl_name)
            else:
                tbl_name = stmt.split()[2]
                tables[tbl_name] = stmt + ";"
                if tbl_name not in table_order:
                    table_order.append(tbl_name)
        elif "INDEX" in stmt:
            m = re.search(r"\bON\s+(\S+)", stmt)
            tbl = m.group(1).strip() if m else "misc"
            indexes.setdefault(tbl, []).append(stmt + ";")
        else:
            tbl_name = "misc"
            tables[tbl_name] = stmt + ";"
            if tbl_name not in table_order:
                table_order.append(tbl_name)

    out = []
    for tbl in table_order:
        out.append(tables[tbl])
        if tbl in indexes:
            for idx in sorted(indexes[tbl]):
                out.append(idx)
    return "\n".join(out) + "\n"


def generate_schema_sql() -> str:
    """G5: Runs Alembic migrations to head on a fresh SQLite database and dumps DDL."""
    from sqlalchemy import create_engine
    from carefold.db.session import run_alembic_migrations

    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        db_path = tmp.name
        engine = create_engine(f"sqlite:///{db_path}")
        with engine.begin() as conn:
            run_alembic_migrations(conn)

        res = subprocess.run(
            ["sqlite3", db_path, ".schema"],
            capture_output=True,
            text=True,
            check=True,
        )
        return canonical_schema(res.stdout)


def generate_tools_json() -> str:
    """G6: Serializes 35 ToolSpecs from _make_builtin_specs() deterministically."""
    from carefold.engine.tool_registry import _make_builtin_specs

    specs = _make_builtin_specs()
    serialized = []
    for s in sorted(specs, key=lambda x: x.name):
        entry = {
            "name": s.name,
            "description": s.description,
            "parameters": s.parameters,
            "risk_tier": s.risk_tier,
            "trust": s.trust,
            "data_flows": {
                "allowed_hosts": list(s.data_flows.allowed_hosts)
                if hasattr(s.data_flows, "allowed_hosts")
                else [],
                "allowed_methods": list(s.data_flows.allowed_methods)
                if hasattr(s.data_flows, "allowed_methods")
                else [],
                "data_sensitivity": s.data_flows.data_sensitivity
                if hasattr(s.data_flows, "data_sensitivity")
                else "internal",
            },
        }
        serialized.append(entry)
    return json.dumps(serialized, indent=2, sort_keys=True) + "\n"


def generate_prompts() -> Dict[str, str]:
    """G7: Renders system prompts for 30 agents, orchestrator routing, and safety preamble."""
    from carefold.agents.registry import AgentRegistry
    from carefold.engine.prompt_builder import build_system_prompt
    from carefold.resources.loader import get_resource_loader
    from carefold.templates.engine import render_template
    from carefold.constants.agents import AGENT_ORCHESTRATOR
    from carefold.constants.defaults import DEFAULT_FORBIDDEN_INTENTS

    registry = AgentRegistry(REPO_ROOT / "agents", REPO_ROOT / "skills")
    prompts_map: Dict[str, str] = {}

    # 1. 30 Agent System Prompts
    for aid in sorted(registry.list_agent_ids()):
        agent = registry.get(aid)
        skills = registry.get_loaded_skills(aid)
        effective_tools = registry.get_effective_tools(aid)
        prompt = build_system_prompt(agent, skills, effective_tools)
        prompts_map[f"{aid}.txt"] = prompt

    # 2. Orchestrator Routing Prompt
    catalog = registry.format_agent_catalog(exclude=AGENT_ORCHESTRATOR)
    prompts = get_resource_loader().get_prompts()
    base_prompt = (
        prompts.get("orchestrator", {}).get("system_prompt")
        or prompts.get("supervisor", {}).get("system_prompt")
        or (
            "You are the Carefold Orchestrator, an intelligent routing and planning coordinator.\n"
            "Analyze the conversation, user intent, and available specialist agents to determine the best specialist to handle the request.\n"
            "Delegate to the single most appropriate specialist. Never answer domain-specific questions yourself."
        )
    )
    context = {
        "base_prompt": base_prompt.strip(),
        "heading": "Available Specialist Agents",
        "catalog": catalog,
        "target_list_name": "catalog",
    }
    prompts_map["orchestrator_routing.txt"] = render_template("orchestrator_routing_prompt", context)

    # 3. Safety Preamble
    loader = get_resource_loader()
    preamble_template = loader.get_safety_preamble_template()
    refusal_data = loader.get_refusal_patterns()
    default_forbidden = refusal_data.get(
        "default_forbidden_intents",
        list(DEFAULT_FORBIDDEN_INTENTS),
    )
    forbidden_str = ", ".join(sorted(default_forbidden))
    prompts_map["safety_preamble.txt"] = preamble_template.format(forbidden_str=forbidden_str)

    return prompts_map


def write_snapshots() -> None:
    """Generates and writes all golden snapshots."""
    GOLDEN_DIR.mkdir(parents=True, exist_ok=True)
    prompts_dir = GOLDEN_DIR / "prompts"
    prompts_dir.mkdir(parents=True, exist_ok=True)

    print("Generating G1 (pytest-ids.txt)...")
    (GOLDEN_DIR / "pytest-ids.txt").write_text(collect_pytest_node_ids(), encoding="utf-8")

    print("Generating G4 (openapi.json)...")
    (GOLDEN_DIR / "openapi.json").write_text(generate_openapi_json(), encoding="utf-8")

    print("Generating G5 (schema.sql)...")
    (GOLDEN_DIR / "schema.sql").write_text(generate_schema_sql(), encoding="utf-8")

    print("Generating G6 (tools.json)...")
    (GOLDEN_DIR / "tools.json").write_text(generate_tools_json(), encoding="utf-8")

    print("Generating G7 (prompts/)...")
    prompts = generate_prompts()
    for filename, content in prompts.items():
        (prompts_dir / filename).write_text(content, encoding="utf-8")

    print("Successfully generated all golden snapshots in tests/golden/")


def verify_snapshots(target: Optional[str] = None) -> bool:
    """Verifies runtime outputs match saved snapshots byte-for-byte."""
    if not GOLDEN_DIR.exists():
        print(f"Error: Golden directory {GOLDEN_DIR} does not exist. Run without --verify first.", file=sys.stderr)
        return False

    failures: List[str] = []

    def check_file(rel_path: str, actual_content: str) -> None:
        target_path = GOLDEN_DIR / rel_path
        if not target_path.exists():
            failures.append(f"Missing snapshot: {rel_path}")
            return
        expected_content = target_path.read_text(encoding="utf-8")
        if actual_content != expected_content:
            diff = list(
                difflib.unified_diff(
                    expected_content.splitlines(keepends=True),
                    actual_content.splitlines(keepends=True),
                    fromfile=f"golden/{rel_path}",
                    tofile=f"runtime/{rel_path}",
                    n=3,
                )
            )
            failures.append(f"Diff detected in {rel_path}:\n" + "".join(diff[:50]))

    targets_to_check = [target] if target else ["pytest", "openapi", "schema", "tools", "prompts"]

    if "pytest" in targets_to_check:
        print("Verifying G1 (pytest-ids.txt)...")
        check_file("pytest-ids.txt", collect_pytest_node_ids())

    if "openapi" in targets_to_check:
        print("Verifying G4 (openapi.json)...")
        check_file("openapi.json", generate_openapi_json())

    if "schema" in targets_to_check:
        print("Verifying G5 (schema.sql)...")
        check_file("schema.sql", generate_schema_sql())

    if "tools" in targets_to_check:
        print("Verifying G6 (tools.json)...")
        check_file("tools.json", generate_tools_json())

    if "prompts" in targets_to_check:
        print("Verifying G7 (prompts/)...")
        prompts = generate_prompts()
        for filename, content in prompts.items():
            check_file(f"prompts/{filename}", content)

    if failures:
        print("\nGolden Snapshot Verification FAILED:", file=sys.stderr)
        for fail in failures:
            print(f"- {fail}", file=sys.stderr)
        return False

    print("\nGolden Snapshot Verification PASSED (100% byte-identical).")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Carefold Golden Snapshot Tool")
    parser.add_argument("--verify", action="store_true", help="Verify against saved golden snapshots")
    parser.add_argument("--check", type=str, choices=["pytest", "openapi", "schema", "tools", "prompts"], help="Verify specific target")
    args = parser.parse_args()

    if args.verify or args.check:
        success = verify_snapshots(target=args.check)
        sys.exit(0 if success else 1)
    else:
        write_snapshots()


if __name__ == "__main__":
    main()
