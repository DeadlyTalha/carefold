"""Agent manifest loader, skill resolver, and permission union engine."""

from __future__ import annotations

import json
from pathlib import Path
from typing import List, Optional, Tuple, Union
import yaml
from pydantic import ValidationError

from carefold.constants.defaults import BUNDLED_AGENT_IDS
from carefold.constants.paths import (
    AGENT_MANIFEST_FILENAME,
    README_FILENAME,
    SKILLS_DIR,
    STARTERS_FILENAME,
    SYSTEM_AGENTS_DIR,
    TEMPLATE_DIR,
)
from carefold.loaders.skill_loader import ManifestValidationError, load_skill
from carefold.loaders.union import (
    ToolValidationError,
    compute_effective_tools,
    validate_tools_in_phase0,
)
from carefold.schemas.manifest import (
    SLUG_REGEX,
    AgentDetailResponse,
    AgentDomain,
    AgentManifest,
    AgentMaturity,
    AgentSummary,
    ResolvedSkillSummary,
    RiskClass,
    SkillManifest,
    ToolDefinitionSchema,
)


def load_agent_starters(agent_dir: Union[Path, str]) -> List[str]:
    """Loads prompt starter strings from starters.json if present."""
    starters_file = Path(agent_dir) / STARTERS_FILENAME
    if not starters_file.is_file():
        return []
    try:
        data = json.loads(starters_file.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return [str(s) for s in data if s]
        if isinstance(data, dict) and "starters" in data and isinstance(data["starters"], list):
            return [str(s) for s in data["starters"] if s]
    except Exception:
        pass
    return []


def load_agent_readme(agent_dir: Union[Path, str]) -> Optional[str]:
    """Loads README.md text if present."""
    readme_file = Path(agent_dir) / README_FILENAME
    if readme_file.is_file():
        try:
            return readme_file.read_text(encoding="utf-8")
        except Exception:
            return None
    return None


def load_agent(
    agent_dir: Union[Path, str],
    skills_dir: Optional[Union[Path, str]] = None,
) -> Tuple[AgentManifest, List[str], List[SkillManifest]]:
    """Loads and validates an agent directory containing agent.yaml and resolves declared skills.

    Returns: (agent_manifest, effective_tools, loaded_skills)
    """
    agent_path = Path(agent_dir).resolve()
    if not agent_path.is_dir():
        raise ManifestValidationError(f'Agent directory not found: "{agent_path}"')

    agent_yaml_path = agent_path / AGENT_MANIFEST_FILENAME
    if not agent_yaml_path.is_file():
        raise ManifestValidationError(f'Missing required agent.yaml in "{agent_path}"')

    try:
        raw_yaml = agent_yaml_path.read_text(encoding="utf-8")
        parsed_yaml = yaml.safe_load(raw_yaml)
    except Exception as err:
        raise ManifestValidationError(f'Malformed YAML in "{agent_yaml_path}": {err}') from err

    if not isinstance(parsed_yaml, dict):
        raise ManifestValidationError(f'Expected YAML dictionary in "{agent_yaml_path}"')

    # Resolve persona file reference if present
    persona_val = parsed_yaml.get("persona")
    persona_file = parsed_yaml.get("persona_file")

    if persona_file and isinstance(persona_file, str):
        target_file = (agent_path / persona_file).resolve()
        if target_file.is_file():
            parsed_yaml["persona"] = target_file.read_text(encoding="utf-8")
            parsed_yaml["persona_file"] = persona_file
        else:
            raise ManifestValidationError(f'Persona file not found: "{persona_file}" in "{agent_path}"')
    elif isinstance(persona_val, str) and "\n" not in persona_val and (persona_val.strip().endswith(".md") or (agent_path / persona_val.strip()).is_file()):
        target_file = (agent_path / persona_val.strip()).resolve()
        if target_file.is_file():
            parsed_yaml["persona"] = target_file.read_text(encoding="utf-8")
            parsed_yaml["persona_file"] = persona_val.strip()
        else:
            raise ManifestValidationError(f'Persona file not found: "{persona_val}" in "{agent_path}"')
    elif (persona_val is None or persona_val == "") and (agent_path / "persona.md").is_file():
        parsed_yaml["persona"] = (agent_path / "persona.md").read_text(encoding="utf-8")
        parsed_yaml["persona_file"] = "persona.md"

    try:
        agent = AgentManifest(**parsed_yaml)
    except ValidationError as err:
        issues = ", ".join(f"{e['loc']}: {e['msg']}" for e in err.errors())
        raise ManifestValidationError(f'Invalid agent.yaml in "{agent_path}": {issues}') from err

    if agent_path.name != agent.id:
        raise ManifestValidationError(
            f'Agent ID mismatch: Directory name "{agent_path.name}" does not match manifest ID "{agent.id}".'
        )

    # Validate agent-declared tools against Phase 0 closed registry
    validate_tools_in_phase0(agent.tools, f'agent "{agent.id}"')

    # Resolve skills directory
    if skills_dir:
        resolved_skills_dir = Path(skills_dir).resolve()
    else:
        # Check standard (2 levels up), nested (_system/ 3 levels up), or sibling skills directory
        for candidate in (
            agent_path.parent.parent / SKILLS_DIR,
            agent_path.parent.parent.parent / SKILLS_DIR,
            agent_path.parent / SKILLS_DIR,
        ):
            if candidate.is_dir():
                resolved_skills_dir = candidate.resolve()
                break
        else:
            resolved_skills_dir = (agent_path.parent.parent / SKILLS_DIR).resolve()

    # Load and validate declared skills
    loaded_skills: List[SkillManifest] = []
    for skill_id in agent.skills:
        if not SLUG_REGEX.match(skill_id):
            raise ManifestValidationError(
                f'Invalid declared skill ID "{skill_id}": Skill IDs must be alphanumeric slugs.'
            )
        skill_path = resolved_skills_dir / skill_id
        if not skill_path.is_dir():
            raise ManifestValidationError(
                f'Missing declared skill: {skill_id} (looked in "{skill_path}")'
            )

        skill = load_skill(skill_path)
        loaded_skills.append(skill)

    # Compute effective tools union: unique(agent.tools ∪ skill.tools) ∩ Phase0Registry
    effective_tools = compute_effective_tools(agent.tools, loaded_skills)

    # Risk class elevation: if any declared skill is clinical_assist, agent is clinical_assist
    if any(s.risk_class == RiskClass.CLINICAL_ASSIST for s in loaded_skills):
        agent.risk_class = RiskClass.CLINICAL_ASSIST

    return agent, effective_tools, loaded_skills


def load_all_agents(
    agents_dir: Union[Path, str],
    skills_dir: Optional[Union[Path, str]] = None,
) -> List[AgentSummary]:
    """Discovers and summarizes all valid agents in agents_dir, including agents/_system."""
    agents_path = Path(agents_dir).resolve()
    if not agents_path.is_dir():
        return []

    candidates: List[Tuple[Path, bool]] = []
    if agents_path.name == SYSTEM_AGENTS_DIR:
        for entry in sorted(agents_path.iterdir()):
            if entry.is_dir() and not entry.name.startswith((".", "_")):
                candidates.append((entry, True))
    else:
        for entry in sorted(agents_path.iterdir()):
            if not entry.is_dir():
                continue
            if entry.name == SYSTEM_AGENTS_DIR:
                for subentry in sorted(entry.iterdir()):
                    if subentry.is_dir() and not subentry.name.startswith((".", "_")):
                        candidates.append((subentry, True))
            elif not entry.name.startswith((".", "_")):
                candidates.append((entry, False))

    candidates.sort(key=lambda item: item[0].name)

    summaries: List[AgentSummary] = []
    for entry, is_system in candidates:
        try:
            agent, effective_tools, _ = load_agent(entry, skills_dir)
            if is_system:
                agent.hidden = True
            starters = load_agent_starters(entry)
            is_bundled = entry.name in BUNDLED_AGENT_IDS

            # Description extraction: prefer manifest.description, fallback to persona
            desc = agent.description
            if not desc:
                if isinstance(agent.persona, str):
                    desc = agent.persona.strip().split("\n")[0]
                elif isinstance(agent.persona, dict):
                    desc = agent.persona.get("role", "")
                elif hasattr(agent.persona, "role") and agent.persona.role:
                    desc = agent.persona.role

            summaries.append(
                AgentSummary(
                    id=agent.id,
                    title=agent.title,
                    version=agent.version,
                    risk_class=agent.risk_class.value,
                    domain=agent.domain,
                    category=agent.category,
                    care_stages=agent.care_stages,
                    target_audience=agent.target_audience,
                    tags=agent.tags,
                    icon=agent.icon,
                    maturity=agent.maturity,
                    skills=agent.skills,
                    effectiveTools=effective_tools,
                    tools=agent.tools,
                    starters=starters,
                    startersCount=len(starters),
                    description=desc,
                    can_delegate=agent.can_delegate,
                    max_iterations=agent.max_iterations,
                    is_bundled=is_bundled,
                    isBundled=is_bundled,
                    clinical_enabled=True,
                    verified=True,
                    hidden=True if is_system else agent.hidden,
                    persona_file=agent.persona_file,
                )
            )
        except Exception as err:
            summaries.append(
                AgentSummary(
                    id=entry.name,
                    title=entry.name,
                    version="0.0.0",
                    risk_class="wellness",
                    domain=AgentDomain.WELLNESS,
                    category="",
                    care_stages=[],
                    target_audience=[],
                    tags=[],
                    icon="Shield",
                    maturity=AgentMaturity.STABLE,
                    skills=[],
                    effectiveTools=[],
                    tools=[],
                    verified=False,
                    hidden=is_system,
                    error=str(err),
                )
            )

    return summaries
