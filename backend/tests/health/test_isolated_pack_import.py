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

"""Automated Isolated Pack Import Test (M4 Autonomy Verification).

Enforces that carefold_health operates 100% autonomously without importing
or referencing any module from the monolithic carefold package.
"""

from pathlib import Path
import subprocess
import sys


def test_isolated_pack_import():
    """Verifies that carefold_health and all its subpackages import without monolithic carefold."""
    script = """
import sys

class BlockMonolithicCarefoldFinder:
    def find_spec(self, fullname, path, target=None):
        if fullname == "carefold" or fullname.startswith("carefold."):
            raise ImportError(
                f"Blocked reverse monolithic import of '{fullname}'. "
                "carefold_health must operate 100% autonomously without carefold."
            )
        return None

sys.meta_path.insert(0, BlockMonolithicCarefoldFinder())

# 1. Import pack root
import carefold_health
assert hasattr(carefold_health, "get_pack"), "carefold_health must expose get_pack()"
assert hasattr(carefold_health, "__version__"), "carefold_health must expose __version__"

# 2. Discover pack via factory
pack = carefold_health.get_pack()
assert pack.id == "health"
assert pack.domain == "health"
assert pack.version == "0.5.0b1"

# 3. Verify health ToolSpecs (17 tools)
from carefold_health.tools import get_health_tool_specs
specs = get_health_tool_specs()
assert len(specs) == 17, f"Expected 17 health tool specs, got {len(specs)}"
assert len(pack.tools) == 17, f"Expected 17 tools in pack manifest, got {len(pack.tools)}"

# 4. Verify health SafetyPolicy
from carefold_health.safety import CarefoldHealthSafetyPolicy
policy = CarefoldHealthSafetyPolicy()
assert policy is not None
assert pack.safety_policy is not None
assert len(policy.get_forbidden_intents()) > 0

# 5. Verify health Routers (9 routers)
from carefold_health.routers import get_health_router_contributions
routers = get_health_router_contributions()
assert len(routers) == 9, f"Expected 9 health router contributions, got {len(routers)}"
assert len(pack.routers) == 9, f"Expected 9 routers in pack manifest, got {len(pack.routers)}"

# 6. Verify Scoped Models (7 models)
from carefold_health.models import (
    Appointment,
    CompanionDevice,
    HealthResource,
    ImportBatch,
    PreventiveRecord,
    SchoolForm,
    SchoolIcsFeed,
)
assert len(pack.scoped_models) == 7

# 7. Assert sys.modules contains zero monolithic carefold modules
carefold_leaks = [m for m in sys.modules if m == "carefold" or m.startswith("carefold.")]
assert not carefold_leaks, f"Detected reverse import leakage in sys.modules: {carefold_leaks}"

print("ISOLATED_PACK_OK")
"""
    repo_root = Path(__file__).resolve().parents[3]
    pythonpath = f"{repo_root}/backend/src:{repo_root}/libs/connectors"
    proc = subprocess.run(
        [sys.executable, "-c", script],
        capture_output=True,
        text=True,
        env={
            "PYTHONPATH": pythonpath,
            "PATH": sys.exec_prefix + "/bin:/usr/bin:/bin",
        },
    )
    assert proc.returncode == 0, f"Subprocess failed with code {proc.returncode}:\nSTDOUT: {proc.stdout}\nSTDERR: {proc.stderr}"
    assert "ISOLATED_PACK_OK" in proc.stdout


def test_isolated_subprocess_execution():
    """Runs a fresh Python subprocess with PYTHONPATH restricted strictly to pack and core."""
    script = """
import sys
class BlockCarefold:
    def find_spec(self, fullname, path, target=None):
        if fullname == 'carefold' or fullname.startswith('carefold.'):
            raise ImportError(f'Blocked monolithic import: {fullname}')
        return None
sys.meta_path.insert(0, BlockCarefold())

import carefold_health
pack = carefold_health.get_pack()
assert pack.id == 'health'
assert len(pack.tools) == 17
assert len(pack.routers) == 9
assert len(pack.scoped_models) == 7
print('ISOLATED_PACK_OK')
"""
    repo_root = Path(__file__).resolve().parents[3]
    pythonpath = f"{repo_root}/backend/src:{repo_root}/libs/connectors"
    proc = subprocess.run(
        [sys.executable, "-c", script],
        capture_output=True,
        text=True,
        env={
            "PYTHONPATH": pythonpath,
            "PATH": sys.exec_prefix + "/bin:/usr/bin:/bin",
        },
    )
    assert proc.returncode == 0, f"Subprocess failed with code {proc.returncode}:\nSTDOUT: {proc.stdout}\nSTDERR: {proc.stderr}"
    assert "ISOLATED_PACK_OK" in proc.stdout
