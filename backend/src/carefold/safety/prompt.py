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

"""Safety preamble builder for injecting immutable system safety constraints.

Preamble templates and forbidden intent categories are externalized to
ResourceLoader (prompts.yaml and refusal_patterns.yaml).
Zero hardcoded preamble text or negative constraint strings in Python code.
"""

from __future__ import annotations

from typing import Sequence
from carefold.constants.defaults import DEFAULT_FORBIDDEN_INTENTS
from carefold.resources.loader import get_resource_loader
from carefold.schemas.manifest import AgentManifest, SkillManifest


def build_safety_preamble(
    agent: AgentManifest,
    skills: Sequence[SkillManifest] = (),
) -> str:
    """Builds the mandatory, immutable safety preamble for agent system prompts."""
    loader = get_resource_loader()
    preamble_template = loader.get_safety_preamble_template()

    refusal_data = loader.get_refusal_patterns()
    default_forbidden = refusal_data.get(
        "default_forbidden_intents",
        list(DEFAULT_FORBIDDEN_INTENTS),
    )

    forbidden_set = {
        *(agent.forbidden or []),
        *(f for s in skills for f in (s.forbidden or [])),
        *default_forbidden,
    }
    forbidden_str = ", ".join(sorted(forbidden_set))

    return preamble_template.format(forbidden_str=forbidden_str)


__all__ = [
    "build_safety_preamble",
]
