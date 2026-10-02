# Carefold — Healthcare AI Agent Marketplace & Runtime
# Copyright 2026 Spectrayan
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Permission union engine for computing effective tools."""

from __future__ import annotations

from typing import Any, Iterable, List, Sequence
from carefold.schemas.manifest import PHASE_0_REGISTRY, SkillManifest


class ToolValidationError(ValueError):
    """Raised when an undeclared or non-Phase0 tool is encountered during validation."""


def validate_tools_in_phase0(tools: Iterable[str], source_name: str = "manifest") -> None:
    """Validates that all tools in the given iterable belong to the Phase 0 closed registry."""
    for tool in tools:
        if tool not in PHASE_0_REGISTRY:
            allowed = sorted(list(PHASE_0_REGISTRY))
            raise ToolValidationError(
                f"Tool '{tool}' in {source_name} is not in Phase 0 closed registry [{', '.join(allowed)}]"
            )


def compute_effective_tools(
    agent_tools: Sequence[str] | None,
    skills: Sequence[Any] | None,
) -> List[str]:
    """Computes the effective tool allowlist for an agent.

    Formula: unique(agent.tools ∪ {tool for s in skills for tool in s.tools}) ∩ PHASE_0_REGISTRY.
    """
    seen: set[str] = set()
    result: List[str] = []

    # Agent declared tools
    for tool in (agent_tools or []):
        if tool in PHASE_0_REGISTRY and tool not in seen:
            seen.add(tool)
            result.append(tool)

    # Skill declared tools
    for skill in (skills or []):
        if hasattr(skill, "tools"):
            skill_tools = skill.tools or []
        elif isinstance(skill, (list, tuple, set)):
            skill_tools = skill
        else:
            skill_tools = []
        for tool in skill_tools:
            if tool in PHASE_0_REGISTRY and tool not in seen:
                seen.add(tool)
                result.append(tool)

    return result
