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

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from hatchling.builders.hooks.plugin.interface import BuildHookInterface

SPECIALIST_AGENTS = [
    "benefits-guide",
    "cardiology-guide",
    "claims-appeals-guide",
    "derma-guide",
    "endocrinology-guide",
    "ent-guide",
    "eye-guide",
    "formulary-guide",
    "gastro-guide",
    "habit-companion",
    "hematology-guide",
    "nephrology-guide",
    "neurology-guide",
    "oncology-navigator",
    "oral-health-guide",
    "ortho-guide",
    "podiatry-guide",
    "prior-auth-navigator",
    "pulmonology-guide",
    "records-coordinator",
    "rheuma-guide",
    "urology-guide",
    "vascular-guide",
    "visit-steward",
]

HEALTH_SYSTEM_AGENTS = [
    "quality-reviewer",
    "triage-auditor",
]

HEALTH_SKILLS = [
    "benefits-explainer",
    "cardiology-prep",
    "claims-appeals-prep",
    "clinical-safety-boundaries",
    "derma-prep",
    "emergency-red-flags",
    "endocrinology-prep",
    "ent-prep",
    "formulary-navigation",
    "gastro-prep",
    "habit-checkin",
    "hematology-prep",
    "nephrology-prep",
    "neurology-prep",
    "oncology-prep",
    "oral-health-prep",
    "ortho-prep",
    "podiatry-prep",
    "preventive-care",
    "prior-auth-prep",
    "pulmonology-prep",
    "records-management",
    "rheuma-prep",
    "urology-prep",
    "vascular-prep",
    "vision-prep",
    "visit-prep",
]


class CustomBuildHook(BuildHookInterface):
    """Hatchling build hook force-including top-level health agents and skills."""

    def initialize(self, version: str, build_data: Dict[str, Any]) -> None:
        root = Path(self.root).parent.parent.parent  # carefold repo root
        force_include = build_data.setdefault("force_include", {})

        # 1. 24 specialist agents
        for agent_name in SPECIALIST_AGENTS:
            agent_dir = root / "agents" / agent_name
            if agent_dir.is_dir():
                force_include[str(agent_dir)] = f"carefold_health/_content/agents/{agent_name}"

        # 2. 2 health system agents
        for sys_agent in HEALTH_SYSTEM_AGENTS:
            sys_agent_dir = root / "agents" / "_system" / sys_agent
            if sys_agent_dir.is_dir():
                force_include[str(sys_agent_dir)] = f"carefold_health/_content/agents/_system/{sys_agent}"

        # 3. 27 health skills
        for skill_name in HEALTH_SKILLS:
            skill_dir = root / "skills" / skill_name
            if skill_dir.is_dir():
                force_include[str(skill_dir)] = f"carefold_health/_content/skills/{skill_name}"
