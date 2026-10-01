"""Handlebars template helper functions for Carefold prompt and report templating."""

from __future__ import annotations

from typing import Any, Iterable, Optional


def helper_join(this: Any, items: Optional[Iterable[Any]], delimiter: str = ", ") -> str:
    """Joins an iterable of items with a delimiter."""
    if items is None:
        return ""
    if isinstance(items, str):
        return items
    return delimiter.join(str(x) for x in items if x is not None)


def helper_default(this: Any, value: Any, default_value: Any) -> Any:
    """Returns value if truthy, otherwise default_value."""
    return value if value else default_value


def helper_eq(this: Any, a: Any, b: Any) -> bool:
    """Equality check."""
    return str(a) == str(b)


def helper_neq(this: Any, a: Any, b: Any) -> bool:
    """Inequality check."""
    return str(a) != str(b)


def helper_upper(this: Any, value: Any) -> str:
    """Converts string to uppercase."""
    return str(value or "").upper()


def helper_lower(this: Any, value: Any) -> str:
    """Converts string to lowercase."""
    return str(value or "").lower()


def helper_first_line(this: Any, value: Any) -> str:
    """Returns the first non-empty line from text."""
    if not value:
        return ""
    for line in str(value).splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line
    return ""


BUILTIN_HELPERS = {
    "join": helper_join,
    "default": helper_default,
    "eq": helper_eq,
    "neq": helper_neq,
    "upper": helper_upper,
    "lower": helper_lower,
    "first_line": helper_first_line,
}

__all__ = ["BUILTIN_HELPERS"]
