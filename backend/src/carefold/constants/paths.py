"""Carefold path and filesystem constants.

Defines canonical folder names, manifest filenames, default file paths,
and environment variable keys for workspace resolution.
"""

from __future__ import annotations

# ============================================================================
# 1. Directory Names
# ============================================================================

DEFAULT_WORKSPACE_ROOT: str = "."
WORKSPACE_DIR: str = "workspace"

AGENTS_DIR: str = "agents"
SYSTEM_AGENTS_DIR: str = "_system"
TEMPLATE_DIR: str = "_template"
SKILLS_DIR: str = "skills"
ATTACHMENTS_DIR: str = "attachments"
NOTES_DIR: str = "notes"
WORKSPACE_NOTES_DIR: str = "workspace/notes"
LOGS_DIR: str = "logs"
CHATS_DIR: str = "chats"
RESOURCES_DIR: str = "resources"
REFERENCES_DIR: str = "references"


# ============================================================================
# 2. Database & Audit Log Filenames
# ============================================================================

AUDIT_LOG_FILENAME: str = "audit.jsonl"
DEFAULT_AUDIT_LOG: str = "logs/audit.jsonl"
DEFAULT_AUDIT_LOG_FILE: str = "audit.jsonl"

SQLITE_DB_FILENAME: str = "checkpoints.db"
DEFAULT_DB_PATH: str = "chats/checkpoints.db"
DEFAULT_CHECKPOINTS_DB: str = "checkpoints.db"

CATALOG_DB_FILENAME: str = "catalog.db"
DEFAULT_CATALOG_DB: str = "catalog.db"


# ============================================================================
# 3. Manifest & Asset Filenames
# ============================================================================

AGENT_MANIFEST_FILENAME: str = "agent.yaml"
AGENT_MANIFEST_FILE: str = "agent.yaml"

SKILL_MANIFEST_FILENAME: str = "SKILL.md"
SKILL_MANIFEST_FILE: str = "SKILL.md"

CAREFOLD_YAML_FILENAME: str = "carefold.yaml"
CAREFOLD_YAML_FILE: str = "carefold.yaml"

STARTERS_FILENAME: str = "starters.json"
STARTERS_FILE: str = "starters.json"

README_FILENAME: str = "README.md"
README_FILE: str = "README.md"


# ============================================================================
# 4. YAML Resource Filenames (under carefold/resources/)
# ============================================================================

DISCLAIMERS_YAML_FILE: str = "disclaimers.yaml"
REFUSAL_PATTERNS_YAML_FILE: str = "refusal_patterns.yaml"
PROMPTS_YAML_FILE: str = "prompts.yaml"
ERRORS_YAML_FILE: str = "errors.yaml"
ROUTING_PATTERNS_YAML_FILE: str = "routing_patterns.yaml"

DISCLAIMERS_YAML: str = "disclaimers.yaml"
REFUSAL_PATTERNS_YAML: str = "refusal_patterns.yaml"
PROMPTS_YAML: str = "prompts.yaml"
ERRORS_YAML: str = "errors.yaml"
ROUTING_PATTERNS_YAML: str = "routing_patterns.yaml"



# ============================================================================
# 5. Environment Variable Names
# ============================================================================

ENV_WORKSPACE_ROOT: str = "CAREFOLD_WORKSPACE_ROOT"
ENV_DB_PATH: str = "CAREFOLD_DB_PATH"
ENV_AUDIT_LOG_PATH: str = "CAREFOLD_AUDIT_LOG_PATH"
ENV_MEMORY_BACKEND: str = "CAREFOLD_MEMORY_BACKEND"
ENV_SPECTOR_URL: str = "CAREFOLD_SPECTOR_URL"
ENV_CATALOG_DB_PATH: str = "CAREFOLD_CATALOG_DB_PATH"
