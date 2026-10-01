"""Agent system prompt assembler."""

from __future__ import annotations

from typing import List, Sequence
from carefold.resources.loader import get_resource_loader
from carefold.safety.prompt import build_safety_preamble
from carefold.schemas.manifest import AgentManifest, SkillManifest


def build_system_prompt(
    agent: AgentManifest,
    skills: Sequence[SkillManifest] = (),
    effective_tools: Sequence[str] = (),
) -> str:
    """Builds the comprehensive system prompt including safety contract, persona, tools, and skills."""
    safety_preamble = build_safety_preamble(agent, skills)

    # Load system prompt section templates from external resources
    loader = get_resource_loader()
    system_prompts = loader.get_prompts().get("system", {})
    persona_header = system_prompts.get("persona_section_header", "# AGENT PERSONA & INSTRUCTIONS")
    capabilities_header = system_prompts.get("capabilities_section_header", "# AVAILABLE CAPABILITIES")
    skills_header = system_prompts.get("skills_section_header", "# SKILL INSTRUCTION PACKS")
    tools_sandboxed_fmt = system_prompts.get("tools_summary_sandboxed", "Available Tools (Sandboxed): {tools}")
    tools_none_str = system_prompts.get("tools_summary_none", "Available Tools: None (Conversational Only)")
    skill_fmt = system_prompts.get("skill_section_format", "### Skill: {name} ({id})\n{instructions}")

    # Persona text
    if isinstance(agent.persona, str):
        persona_text = agent.persona.strip()
    elif isinstance(agent.persona, dict):
        role = agent.persona.get("role")
        tone = agent.persona.get("tone")
        instructions = agent.persona.get("instructions")
        lines = []
        if role:
            lines.append(f"Role: {role}")
        if tone:
            lines.append(f"Tone: {tone}")
        if instructions:
            lines.append(f"Instructions: {instructions}")
        persona_text = "\n".join(lines)
    else:
        role = getattr(agent.persona, "role", None)
        tone = getattr(agent.persona, "tone", None)
        instructions = getattr(agent.persona, "instructions", None)
        lines = []
        if role:
            lines.append(f"Role: {role}")
        if tone:
            lines.append(f"Tone: {tone}")
        if instructions:
            lines.append(f"Instructions: {instructions}")
        persona_text = "\n".join(lines)

    # Skills instructions
    skill_sections: List[str] = []
    for skill in skills:
        if skill.instructions and skill.instructions.strip():
            rendered_skill = skill_fmt.format(
                name=skill.name,
                id=skill.id,
                instructions=skill.instructions.strip(),
            )
            skill_sections.append(rendered_skill)

    # Tools summary
    if effective_tools:
        tools_summary = tools_sandboxed_fmt.format(tools=", ".join(effective_tools))
    else:
        tools_summary = tools_none_str

    sections = [
        safety_preamble,
        "",
        persona_header,
        f"Agent ID: {agent.id}",
        f"Title: {agent.title}",
        f"Risk Class: {agent.risk_class.value}",
        persona_text,
        "",
        capabilities_header,
        tools_summary,
    ]

    if skill_sections:
        sections.extend(["", skills_header, "\n\n".join(skill_sections)])

    return "\n".join(sections)
