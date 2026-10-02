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

"""Critic and self-correction loop node (F-28).

Increments reflection counter, generates self-correction feedback prompts,
preserves previous output attempts, and enforces strict max_reflections retry ceilings.
"""

from __future__ import annotations

from typing import Any, Dict, List
from carefold.constants.defaults import DEFAULT_MAX_REFLECTIONS
from carefold.workflows.nodes.base import BaseNode


class ReflectionNode(BaseNode):
    """Critic and self-correction loop capped by max retries."""

    def __init__(
        self,
        max_reflections: int = DEFAULT_MAX_REFLECTIONS,
        name: str = "reflection",
    ) -> None:
        super().__init__(name=name)
        self.max_reflections = max_reflections

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates retry budget and increments reflection count."""
        raw_count = state.get("reflection_count", 0)
        current_count = max(0, int(raw_count))
        max_refl = int(state.get("max_reflections", self.max_reflections))

        # Ceiling check: if max_reflections is 0 or current count reached ceiling
        if max_refl <= 0 or current_count >= max_refl:
            return {
                "reflection_count": current_count,
                "next_step": "done",
                "critique": "Maximum reflection retries reached. Halting self-correction loop.",
                "previous_attempts": list(state.get("previous_attempts", [])),
            }

        new_count = current_count + 1
        previous_attempts = list(state.get("previous_attempts", []))
        if state.get("output"):
            previous_attempts.append(str(state["output"]))

        critique = (
            f"Self-correction directive (Attempt {new_count} of {max_refl}): "
            f"The previous response violated clinical safety guardrails ({state.get('refusal_reason', 'clinical intent')}). "
            f"Please revise your answer to provide wellness and care navigation support only. "
            f"Do not provide medical diagnosis, dosage calculations, or clinical treatment advice."
        )

        next_step = "agent"

        return {
            "reflection_count": new_count,
            "next_step": next_step,
            "critique": critique,
            "previous_attempts": previous_attempts,
        }


__all__ = ["ReflectionNode"]
