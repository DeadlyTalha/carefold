"""AI follow-up question chip generator node (F-30).

Generates 2-4 contextual follow-up question chips dynamically via model invocation
using prompts/suggestions/generation.md, with offline fallback to curated chips.
Strictly suppresses chip generation if a safety refusal occurred (`is_refusal=True`).
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from carefold.resources.loader import get_resource_loader
from carefold.workflows.nodes.base import BaseNode

logger = logging.getLogger(__name__)


class SuggestionNode(BaseNode):
    """AI follow-up next question generator supporting dynamic LLM generation and curated fallbacks."""

    def __init__(
        self,
        model: Optional[BaseChatModel] = None,
        name: str = "suggestion",
    ) -> None:
        super().__init__(name=name)
        self.model = model

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generates up to 4 follow-up suggestion chips."""
        # Strictly suppress suggestion chips on safety refusal
        if state.get("is_refusal") or state.get("refused"):
            return {
                "follow_up_suggestions": [],
                "next_step": "done",
            }

        agent_id = str(state.get("current_agent") or state.get("agent_id") or "visit-steward")
        messages: List[Any] = state.get("messages", [])

        prompt_text = ""
        completion_text = str(state.get("output", ""))

        for m in reversed(messages):
            if isinstance(m, HumanMessage) or (isinstance(m, dict) and m.get("role") in ("user", "human")):
                prompt_text = str(getattr(m, "content", "") if isinstance(m, HumanMessage) else m.get("content", ""))
                break

        if not completion_text:
            for m in reversed(messages):
                if isinstance(m, AIMessage) or (isinstance(m, dict) and m.get("role") in ("assistant", "ai")):
                    completion_text = str(getattr(m, "content", "") if isinstance(m, AIMessage) else m.get("content", ""))
                    break

        tools_used = [t.get("tool") for t in state.get("tool_traces", []) if t.get("allowed")]

        chips: List[str] = []

        # 1. Dynamic LLM generation if model is present and context exists
        if self.model is not None and (prompt_text or completion_text):
            try:
                loader = get_resource_loader()
                prompt_tmpl = loader.get_prompt_text("suggestions/generation")
                rendered_prompt = prompt_tmpl.format(
                    agent_title=agent_id.replace("-", " ").title(),
                    user_prompt=prompt_text or "(none)",
                    assistant_response=completion_text or "(none)",
                    tools_used=", ".join(tools_used) if tools_used else "None",
                )
                resp = await self.model.ainvoke([SystemMessage(content=rendered_prompt)])
                content = str(getattr(resp, "content", "") or "").strip()

                parsed = None
                try:
                    parsed = json.loads(content)
                except Exception:
                    match = re.search(r"\[.*\]", content, re.DOTALL)
                    if match:
                        parsed = json.loads(match.group(0))

                if isinstance(parsed, list):
                    chips = [str(c).strip() for c in parsed if isinstance(c, str) and c.strip()][:4]
            except Exception as err:
                logger.debug("Dynamic suggestion generation failed: %s; falling back to curated chips", err)

        # 2. Offline / parameterless fallback to curated chips from ResourceLoader
        if not chips:
            raw_chips = get_resource_loader().get_follow_up_suggestions(
                agent_id=agent_id,
                prompt=prompt_text,
                completion=completion_text,
                tools_used=tools_used,
            )
            chips = list(raw_chips)[:4]

        return {
            "follow_up_suggestions": chips,
            "next_step": "done",
        }


__all__ = ["SuggestionNode"]
