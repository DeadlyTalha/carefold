"""Output refusal guardrail and compliance disclaimer node (F-27).

Inspects generated model completion. If clinical advice or prohibited intent
is detected, sets refusal flag and routes to self-correction reflection.
Appends compliance disclaimers to valid responses.
"""

from __future__ import annotations

from typing import Any, Dict, List
from langchain_core.messages import AIMessage

from carefold.resources.loader import get_resource_loader
from carefold.safety.classifier import check_safety_refusal
from carefold.workflows.nodes.base import BaseNode


class OutputGuardrailNode(BaseNode):
    """Verifies output safety and appends compliance disclaimers."""

    def __init__(self, name: str = "output_guardrail") -> None:
        super().__init__(name=name)

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Checks output text against clinical refusal boundaries."""
        output_text = state.get("output", "")
        if not output_text:
            messages: List[Any] = state.get("messages", [])
            last_ai = next((m for m in reversed(messages) if isinstance(m, AIMessage)), None)
            if last_ai:
                output_text = str(getattr(last_ai, "content", "") or "")
            elif messages and isinstance(messages[-1], dict) and messages[-1].get("role") in ("assistant", "ai"):
                output_text = str(messages[-1].get("content", ""))

        safety_check = check_safety_refusal(output_text)

        if safety_check.refused:
            reason = safety_check.reason or "forbidden_intent:medical_prohibited"
            return {
                "is_refusal": True,
                "refused": True,
                "refusal_reason": reason,
                "next_step": "reflection",
                "is_compliant": False,
                "compliance_metadata": {
                    "compliant": False,
                    "reason": reason,
                },
            }

        # Clean robotic reference doc preamble
        import re
        pattern = r"^(?:(?:\*|_){0,2}(?:(?:Based on|According to|From) (?:the )?(?:provided )?reference (?:document|guide|material|checklist|information|docs?)(?: provided)?)[,:]?(?:\*|_){0,2}[,:]?\s*)"
        cleaned_output = re.sub(pattern, "", output_text.lstrip(), flags=re.IGNORECASE).lstrip("*_ \t")
        if cleaned_output and cleaned_output != output_text:
            cleaned_output = cleaned_output[0].upper() + cleaned_output[1:] if len(cleaned_output) > 1 else cleaned_output.upper()
            output_text = cleaned_output

        # Appends standard compliance disclaimer
        loader = get_resource_loader()
        header_text = loader.get_disclaimer_header_text()
        disclaimer_clause = f"\n\n*Disclaimer: {header_text}*"

        final_output = output_text
        if header_text and header_text.lower() not in output_text.lower():
            final_output = f"{output_text}{disclaimer_clause}"

        return {
            "is_refusal": False,
            "refused": False,
            "is_compliant": True,
            "output": final_output,
            "compliance_disclaimer": header_text,
            "disclaimer": header_text,
            "compliance_metadata": {
                "compliant": True,
                "has_disclaimer": True,
            },
            "next_step": "suggestion",
        }


__all__ = ["OutputGuardrailNode"]
