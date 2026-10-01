"""Pre-execution clinical safety guardrail node (F-22).

Evaluates user prompt against 34 clinical refusal patterns in refusal_patterns.yaml
via `check_safety_refusal`. Intercepts clinical diagnosis, dosing, emergency diversion,
and medication discontinuation before model or tool invocation.
"""

from __future__ import annotations

from typing import Any, Dict, List
from langchain_core.messages import BaseMessage, HumanMessage

from carefold.safety.classifier import check_safety_refusal
from carefold.workflows.nodes.base import BaseNode


class InputGuardrailNode(BaseNode):
    """Pre-execution guardrail evaluating clinical safety."""

    def __init__(self, name: str = "input_guardrail") -> None:
        super().__init__(name=name)

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates clinical safety on the most recent user prompt."""
        messages: List[Any] = state.get("messages", [])
        prompt_text = ""

        # Extract latest human message content
        for m in reversed(messages):
            if isinstance(m, dict):
                if m.get("role") in ("user", "human"):
                    prompt_text = str(m.get("content") or "")
                    break
            elif isinstance(m, HumanMessage) or getattr(m, "type", "") in ("human", "user"):
                prompt_text = str(getattr(m, "content", "") or "")
                break
            elif isinstance(m, BaseMessage):
                prompt_text = str(getattr(m, "content", "") or "")
                break

        if not prompt_text and state.get("prompt"):
            prompt_text = str(state.get("prompt"))

        safety_check = check_safety_refusal(prompt_text)

        if safety_check.refused:
            reason = safety_check.reason or "forbidden_intent:medical_prohibited"
            return {
                "is_refusal": True,
                "refused": True,
                "refusal_reason": reason,
                "next_step": "refusal",
                "tool_calls": [],  # Suppress pending tool calls on safety refusal
                "safety_metadata": {
                    "checked": True,
                    "refused": True,
                    "reason": reason,
                    "category": reason.replace("forbidden_intent:", ""),
                },
            }

        return {
            "is_refusal": False,
            "refused": False,
            "refusal_reason": None,
            "next_step": "supervisor",
            "safety_metadata": {
                "checked": True,
                "refused": False,
                "reason": None,
            },
        }


__all__ = ["InputGuardrailNode"]
