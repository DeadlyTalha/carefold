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

"""LangChain multi-provider Strategy ModelFactory for Carefold.

Supports:
- ollama: Local Ollama server (http://127.0.0.1:11434/v1, llama3.2, zero keys)
- google: Google Gemini (gemini-2.0-flash, gemini-1.5-pro via langchain-google-genai)
- anthropic: Anthropic Claude (claude-3-5-sonnet-latest, claude-3-5-haiku via langchain-anthropic)
- openai: OpenAI (gpt-4o, gpt-4o-mini via langchain-openai)
- custom: OpenAI-compatible user-specified base_url and model

API Key Precedence:
Client-supplied key (request payload/kwargs) strictly overrides server environment variables.

Mock Purge:
Zero mock parameters, zero mock returns. All test doubles reside strictly in tests/fixtures/.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional, Type

try:
    from langchain_core.language_models.chat_models import BaseChatModel
except ImportError:
    BaseChatModel = object  # type: ignore[assignment,misc]

from carefold.constants.models import (
    DEFAULT_MODEL,
    DEFAULT_MODELS,
    DEFAULT_MODEL_TIMEOUT_SECONDS,
    DEFAULT_OLLAMA_URL,
    DEFAULT_TEMPERATURE,
    ENV_ANTHROPIC_API_KEYS,
    ENV_CUSTOM_API_KEYS,
    ENV_CUSTOM_URLS,
    ENV_GOOGLE_API_KEYS,
    ENV_OLLAMA_URLS,
    ENV_OPENAI_API_KEYS,
    PROVIDER_ALIASES,
    PROVIDER_ANTHROPIC,
    PROVIDER_CUSTOM,
    PROVIDER_GOOGLE,
    PROVIDER_OLLAMA,
    PROVIDER_OPENAI,
    SUPPORTED_PROVIDERS,
)

logger = logging.getLogger(__name__)


# ============================================================================
# Exceptions
# ============================================================================

class ModelFactoryError(Exception):
    """Base exception for Carefold model factory errors."""
    pass


class MissingApiKeyError(ModelFactoryError, ValueError):
    """Raised when a required API key is missing from both request parameters and environment variables."""

    def __init__(self, provider: str, env_vars: List[str]) -> None:
        self.provider = provider
        self.env_vars = env_vars
        env_str = " or ".join(f"${var}" for var in env_vars)
        super().__init__(
            f"API key for provider '{provider}' is missing. "
            f"Please specify an API key in the request settings or set {env_str} on the server."
        )


class MissingConfigurationError(ModelFactoryError, ValueError):
    """Raised when a required provider configuration (e.g. base_url for custom provider) is missing."""
    pass


class UnsupportedProviderError(ModelFactoryError, ValueError):
    """Raised when an unknown model provider is requested."""

    def __init__(self, provider: str, supported: List[str]) -> None:
        self.provider = provider
        self.supported = supported
        super().__init__(
            f"Unsupported model provider '{provider}'. "
            f"Supported providers: {', '.join(supported)}."
        )


# ============================================================================
# Key and URL Resolution Helpers
# ============================================================================

def resolve_api_key(
    provider: str,
    client_key: Optional[str] = None,
    allow_missing: bool = False,
) -> Optional[str]:
    """Resolves API key with strict precedence:
    1. Client request parameter (client_key)
    2. Server environment variables
    
    Raises MissingApiKeyError if key is missing and allow_missing is False.
    """
    if client_key and str(client_key).strip():
        return str(client_key).strip()

    env_map = {
        PROVIDER_GOOGLE: list(ENV_GOOGLE_API_KEYS),
        PROVIDER_ANTHROPIC: list(ENV_ANTHROPIC_API_KEYS),
        PROVIDER_OPENAI: list(ENV_OPENAI_API_KEYS),
        PROVIDER_CUSTOM: list(ENV_CUSTOM_API_KEYS),
    }

    env_vars = env_map.get(provider, [])
    for var in env_vars:
        val = os.getenv(var)
        if val and val.strip():
            return val.strip()

    if allow_missing or provider == PROVIDER_OLLAMA:
        return None

    # For custom provider, if no key is set anywhere, default to "custom" dummy key
    # since many local custom endpoints (e.g. vLLM, LMStudio) don't need auth,
    # but OpenAI client requires a non-empty string.
    if provider == PROVIDER_CUSTOM:
        return "custom"

    raise MissingApiKeyError(provider=provider, env_vars=env_vars)


def resolve_base_url(
    provider: str,
    client_base_url: Optional[str] = None,
) -> Optional[str]:
    """Resolves base URL for providers requiring or supporting custom endpoints."""
    if client_base_url and str(client_base_url).strip():
        return str(client_base_url).strip().rstrip("/")

    if provider == PROVIDER_OLLAMA:
        for var in ENV_OLLAMA_URLS:
            env_ollama = os.getenv(var)
            if env_ollama and env_ollama.strip():
                return env_ollama.strip().rstrip("/")
        # Fall back to settings.ollama_url or default
        try:
            from carefold.config import settings
            return settings.ollama_url.rstrip("/")
        except Exception:
            return DEFAULT_OLLAMA_URL

    if provider == PROVIDER_CUSTOM:
        for var in ENV_CUSTOM_URLS:
            env_custom = os.getenv(var)
            if env_custom and env_custom.strip():
                return env_custom.strip().rstrip("/")
        raise MissingConfigurationError(
            "Base URL for custom provider is required. "
            "Please provide 'base_url' (or 'baseUrl') in the request settings "
            "or set the $CUSTOM_BASE_URL environment variable on the server."
        )

    return None


# ============================================================================
# ModelFactory (Strategy Dispatcher)
# ============================================================================

class ModelFactory:
    """Strategy-based factory for dynamically resolving and creating LLM chat models.

    Responsibilities:
    - Normalizes provider aliases case-insensitively.
    - Dispatches to concrete BaseModelProvider strategies.
    - Enforces zero mock parameters or mock returns.
    """

    _custom_providers: Dict[str, Any] = {}

    @classmethod
    def register_provider(cls, name: str, provider_cls: Any) -> None:
        """Register a custom or third-party provider strategy."""
        from carefold.model.providers import ProviderRegistry
        ProviderRegistry.register(name, provider_cls)
        cls._custom_providers[name.strip().lower()] = provider_cls

    @classmethod
    def get_available_providers(cls) -> List[str]:
        """Return list of supported provider identifiers, strictly excluding 'mock'."""
        try:
            from carefold.model.providers import ProviderRegistry
            registered = ProviderRegistry.list_providers()
        except ImportError:
            registered = list(SUPPORTED_PROVIDERS)

        available = [p for p in registered if p.lower() != "mock"]
        for p in SUPPORTED_PROVIDERS:
            if p not in available and p.lower() != "mock":
                available.append(p)
        return available

    @classmethod
    def resolve_provider(cls, provider: Any) -> str:
        """Resolve a provider alias or string case-insensitively to its canonical identifier.

        Raises:
            UnsupportedProviderError: If the provider is invalid, empty, unrecognized, or 'mock'.
        """
        available = cls.get_available_providers()

        # Handle None -> default to Ollama
        if provider is None:
            return PROVIDER_OLLAMA

        # Reject non-string or empty / whitespace inputs
        if not isinstance(provider, str):
            raise UnsupportedProviderError(str(provider), available)

        raw = provider.strip()
        if not raw:
            raise UnsupportedProviderError("", available)

        norm = raw.lower()

        # Explicitly reject purged mock references
        if norm in ("mock", "offline", "stub"):
            raise UnsupportedProviderError(raw, available)

        canonical = PROVIDER_ALIASES.get(norm, norm)
        if canonical not in available:
            raise UnsupportedProviderError(raw, available)

        return canonical

    @classmethod
    def create_chat_model(
        cls,
        provider: Optional[str] = PROVIDER_OLLAMA,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: float = DEFAULT_TEMPERATURE,
        timeout: Optional[float] = None,
        streaming: bool = True,
        **kwargs: Any,
    ) -> BaseChatModel:
        """Instantiate a LangChain chat model via the appropriate provider strategy.

        Args:
            provider: Provider name (e.g. 'ollama', 'google', 'anthropic', 'openai', 'custom').
            model: Model name override (defaults to provider's default model).
            api_key: Optional client-supplied API key.
            base_url: Optional custom endpoint URL.
            temperature: Sampling temperature (defaults to 0.0 for clinical determinism).
            timeout: Invocation timeout in seconds.
            streaming: Whether streaming mode is enabled.
            **kwargs: Extra parameters passed to the provider strategy.

        Returns:
            An instantiated LangChain BaseChatModel.

        Raises:
            UnsupportedProviderError: If provider is unrecognized or 'mock'.
            MissingApiKeyError: If required credentials are missing.
            MissingConfigurationError: If required endpoint config is missing.
        """
        # Validate temperature type
        if not isinstance(temperature, (int, float)):
            try:
                temperature = float(temperature)
            except (ValueError, TypeError) as err:
                raise TypeError(f"Temperature must be numeric, got {type(temperature).__name__}") from err

        # Purge legacy mock kwargs if present
        kwargs.pop("mock", None)
        kwargs.pop("use_mock", None)

        # 1. Resolve canonical provider
        canonical = cls.resolve_provider(provider)

        # 2. Extract common parameter aliases
        resolved_model = model or kwargs.pop("model_name", None) or DEFAULT_MODELS.get(canonical, DEFAULT_MODEL)
        effective_api_key = api_key or kwargs.pop("apiKey", None)
        effective_base_url = base_url or kwargs.pop("baseUrl", None)
        effective_timeout = timeout if timeout is not None else DEFAULT_MODEL_TIMEOUT_SECONDS

        # 3. Retrieve provider strategy class
        from carefold.model.providers import ProviderRegistry
        provider_cls = ProviderRegistry.get(canonical)
        if not provider_cls:
            raise UnsupportedProviderError(canonical, cls.get_available_providers())

        # 4. Instantiate provider strategy
        provider_instance = provider_cls(
            api_key=effective_api_key,
            base_url=effective_base_url,
        )

        # 5. Delegate model creation to the strategy
        return provider_instance.create_model(
            model=resolved_model,
            temperature=temperature,
            timeout=effective_timeout,
            streaming=streaming,
            api_key=effective_api_key,
            base_url=effective_base_url,
            **kwargs,
        )


# ============================================================================
# Backward-Compatible Top-Level Function Facade
# ============================================================================

def create_chat_model(
    provider: Optional[str] = PROVIDER_OLLAMA,
    model: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    temperature: float = DEFAULT_TEMPERATURE,
    timeout: Optional[float] = None,
    streaming: bool = True,
    **kwargs: Any,
) -> BaseChatModel:
    """Unified LangChain model factory function delegating to ModelFactory.

    Preserves 100% backward compatibility for existing callers:
    `from carefold.model.factory import create_chat_model`
    """
    return ModelFactory.create_chat_model(
        provider=provider,
        model=model,
        api_key=api_key,
        base_url=base_url,
        temperature=temperature,
        timeout=timeout,
        streaming=streaming,
        **kwargs,
    )


__all__ = [
    "ModelFactory",
    "create_chat_model",
    "MissingApiKeyError",
    "MissingConfigurationError",
    "UnsupportedProviderError",
    "ModelFactoryError",
    "SUPPORTED_PROVIDERS",
    "PROVIDER_ALIASES",
    "DEFAULT_MODELS",
    "resolve_api_key",
    "resolve_base_url",
]
