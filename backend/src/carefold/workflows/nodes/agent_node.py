"""Agent prompt assembly and model invocation node (F-24).

Assembles system prompt with safety preamble, binds authorized tools,
invokes the chat model, updates message state, and captures tool calls.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Sequence
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage

from carefold.resources.loader import get_resource_loader
from carefold.workflows.nodes.base import BaseNode

logger = logging.getLogger(__name__)


class AgentNode(BaseNode):
    """Manages agent prompt assembly and model invocation."""

    def __init__(
        self,
        model: Optional[BaseChatModel] = None,
        tools: Optional[Sequence[Any]] = None,
        system_prompt: Optional[str] = None,
        name: str = "agent",
    ) -> None:
        super().__init__(name=name)
        self.model = model
        self.tools = tools or []
        self.system_prompt = system_prompt

    def assemble_system_prompt(self, state: Dict[str, Any]) -> str:
        """Assembles the system prompt including safety preamble and agent instructions."""
        if state.get("system_prompt"):
            return str(state["system_prompt"])
        if self.system_prompt:
            return self.system_prompt

        loader = get_resource_loader()
        prompts = loader.get_prompts()
        agent_id = (state.get("current_agent") or state.get("agent_id") or "visit-steward").replace("-", "_")
        agent_instructions = prompts.get("agents", {}).get(agent_id, "")

        preamble = loader.get_safety_preamble_template().format(
            forbidden_str="clinical diagnosis, dosing, triage replacement, treatment alteration"
        )
        if agent_instructions:
            return f"{preamble}\n\n# AGENT INSTRUCTIONS\n{agent_instructions}"
        return preamble

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Assembles prompt, calls model, updates messages, and captures tool_calls."""
        system_prompt = self.assemble_system_prompt(state)
        raw_messages: List[Any] = list(state.get("messages", []))

        # Convert dictionary messages to LangChain message instances if needed
        lc_messages: List[BaseMessage] = []
        for m in raw_messages:
            if isinstance(m, BaseMessage):
                lc_messages.append(m)
            elif isinstance(m, dict):
                role = m.get("role", "")
                content = str(m.get("content", ""))
                if role in ("system",):
                    lc_messages.append(SystemMessage(content=content))
                elif role in ("assistant", "ai"):
                    lc_messages.append(AIMessage(content=content, tool_calls=m.get("tool_calls", [])))
                else:
                    lc_messages.append(HumanMessage(content=content))

        # Inject system prompt at index 0 if not already present
        if system_prompt and not (lc_messages and isinstance(lc_messages[0], SystemMessage)):
            lc_messages = [SystemMessage(content=system_prompt)] + lc_messages

        # Resolve model
        model = self.model or state.get("model")
        if model is None:
            return {
                "messages": [AIMessage(content="I am ready to assist with your healthcare administration.")],
                "output": "I am ready to assist with your healthcare administration.",
                "tool_calls": [],
                "next_step": "output_guardrail",
            }

        # Bind tools if provided and supported
        effective_tools = self.tools or state.get("tools") or []
        bound_model = model
        if effective_tools and hasattr(model, "bind_tools"):
            try:
                bound_model = model.bind_tools(effective_tools)
            except (NotImplementedError, Exception) as err:
                logger.debug("Model bind_tools not supported or skipped: %s", err)

        try:
            if hasattr(bound_model, "ainvoke"):
                response = await bound_model.ainvoke(lc_messages)
            else:
                response = bound_model.invoke(lc_messages)
        except Exception as exc:
            logger.error("AgentNode model invocation failed: %s", exc)
            return {
                "error": str(exc),
                "error_exception": exc,
                "next_step": "error",
            }

        tool_calls = getattr(response, "tool_calls", []) or []
        next_step = "tools" if tool_calls else "output_guardrail"

        return {
            "messages": [response],
            "output": getattr(response, "content", ""),
            "tool_calls": tool_calls,
            "next_step": next_step,
        }


__all__ = ["AgentNode"]
