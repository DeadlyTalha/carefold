"""Dynamic Handlebars template engine for prompts and system messages.

Inspired by Spector's Handlebars template engine, this module enables
domain-agnostic, data-driven system prompts, agent identity cards,
and capability summaries without hardcoded string concatenations in Python.
"""

from __future__ import annotations

import logging
from pathlib import Path
import threading
from typing import Any, Callable, Dict, Optional, Union

from carefold.templates.helpers import BUILTIN_HELPERS

logger = logging.getLogger(__name__)

# Try importing pybars Compiler
try:
    from pybars import Compiler as PybarsCompiler
    _PYBARS_AVAILABLE = True
except ImportError:
    _PYBARS_AVAILABLE = False
    PybarsCompiler = None  # type: ignore[assignment,misc]


class TemplateEngine:
    """Handlebars template compiler and cache for dynamic prompt assembly."""

    def __init__(self, templates_dir: Optional[Union[Path, str]] = None) -> None:
        if templates_dir:
            self.templates_dir = Path(templates_dir).resolve()
        else:
            # Default to backend/src/carefold/resources/prompts/templates
            self.templates_dir = (
                Path(__file__).parent.parent / "resources" / "prompts" / "templates"
            ).resolve()

        self._compiler = PybarsCompiler() if _PYBARS_AVAILABLE else None
        self._compiled_cache: Dict[str, Any] = {}
        self._helpers: Dict[str, Callable] = dict(BUILTIN_HELPERS)
        self._lock = threading.RLock()

    def register_helper(self, name: str, helper_fn: Callable) -> None:
        """Registers a custom Handlebars helper function."""
        with self._lock:
            self._helpers[name] = helper_fn

    def resolve_template_source(
        self,
        template_name_or_source: str,
        custom_dir: Optional[Union[Path, str]] = None,
    ) -> str:
        """Resolves template source string from file or returns raw string if contains Handlebars tags."""
        # If it contains newlines or handlebars tags, treat as raw template content
        if "{{" in template_name_or_source and "}}" in template_name_or_source:
            return template_name_or_source

        # Otherwise resolve from disk
        candidate_dirs = []
        if custom_dir:
            candidate_dirs.append(Path(custom_dir).resolve())
        candidate_dirs.append(self.templates_dir)

        filename = template_name_or_source
        if not filename.endswith((".hbs", ".handlebars")):
            filename = f"{filename}.hbs"

        for d in candidate_dirs:
            p = d / filename
            if p.is_file():
                return p.read_text(encoding="utf-8")

        # Fallback check for exact name
        for d in candidate_dirs:
            p = d / template_name_or_source
            if p.is_file():
                return p.read_text(encoding="utf-8")

        raise FileNotFoundError(
            f"Handlebars template '{template_name_or_source}' not found in candidate directories: {candidate_dirs}"
        )

    def compile(
        self,
        template_name_or_source: str,
        custom_dir: Optional[Union[Path, str]] = None,
    ) -> Any:
        """Compiles a Handlebars template and returns the callable renderer."""
        cache_key = f"{custom_dir}::{template_name_or_source}"
        if cache_key in self._compiled_cache:
            return self._compiled_cache[cache_key]

        with self._lock:
            if cache_key in self._compiled_cache:
                return self._compiled_cache[cache_key]

            source = self.resolve_template_source(template_name_or_source, custom_dir)
            if self._compiler is not None:
                compiled = self._compiler.compile(source)
            else:
                # Fallback simple string renderer if pybars is absent
                compiled = self._fallback_compile(source)

            self._compiled_cache[cache_key] = compiled
            return compiled

    def render(
        self,
        template_name_or_source: str,
        context: Dict[str, Any],
        custom_dir: Optional[Union[Path, str]] = None,
    ) -> str:
        """Compiles (if needed) and renders a Handlebars template with the given context."""
        renderer = self.compile(template_name_or_source, custom_dir)
        try:
            if self._compiler is not None:
                rendered = renderer(context, helpers=self._helpers)
            else:
                rendered = renderer(context)
            return str(rendered).strip()
        except Exception as err:
            logger.warning(
                "Error rendering Handlebars template '%s': %s; falling back to basic rendering",
                template_name_or_source,
                err,
            )
            return self._fallback_render(self.resolve_template_source(template_name_or_source, custom_dir), context)

    def _fallback_compile(self, source: str) -> Callable[[Dict[str, Any]], str]:
        """Provides basic variable replacement fallback if pybars is unavailable."""
        def _render(ctx: Dict[str, Any]) -> str:
            return self._fallback_render(source, ctx)
        return _render

    def _fallback_render(self, source: str, context: Dict[str, Any]) -> str:
        """Lightweight regex-based fallback for simple {{variable}} and {{{variable}}} interpolation."""
        import re

        def _resolve_var(var_path: str, data: Dict[str, Any]) -> str:
            parts = var_path.strip().split(".")
            curr = data
            for part in parts:
                if isinstance(curr, dict):
                    curr = curr.get(part, "")
                elif hasattr(curr, part):
                    curr = getattr(curr, part, "")
                else:
                    return ""
            return str(curr or "")

        res = source
        # Triple-stash unescaped
        res = re.sub(r"\{\{\{([\w\.]+)\}\}\}", lambda m: _resolve_var(m.group(1), context), res)
        # Double-stash
        res = re.sub(r"\{\{([\w\.]+)\}\}", lambda m: _resolve_var(m.group(1), context), res)
        # Clean unhandled blocks
        res = re.sub(r"\{\{#[^}]+\}\}.*?\{\{/[^}]+\}\}", "", res, flags=re.DOTALL)
        return res.strip()


_DEFAULT_ENGINE: Optional[TemplateEngine] = None
_ENGINE_LOCK = threading.Lock()


def get_template_engine(templates_dir: Optional[Union[Path, str]] = None) -> TemplateEngine:
    """Returns singleton TemplateEngine instance."""
    global _DEFAULT_ENGINE
    if _DEFAULT_ENGINE is None or templates_dir is not None:
        with _ENGINE_LOCK:
            if _DEFAULT_ENGINE is None or templates_dir is not None:
                engine = TemplateEngine(templates_dir)
                if templates_dir is None:
                    _DEFAULT_ENGINE = engine
                return engine
    return _DEFAULT_ENGINE


def render_template(
    template_name_or_source: str,
    context: Dict[str, Any],
    custom_dir: Optional[Union[Path, str]] = None,
) -> str:
    """Convenience functional wrapper to render a template."""
    return get_template_engine().render(template_name_or_source, context, custom_dir)


__all__ = [
    "TemplateEngine",
    "get_template_engine",
    "render_template",
]
