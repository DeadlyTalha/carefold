"""Carefold model components, provider strategies, and ModelFactory.

Re-exports the Strategy pattern architecture:
- ModelFactory: Primary factory for resolving and instantiating LLM chat models.
- create_chat_model: Backward-compatible functional factory facade.
- Provider strategies: OllamaProvider, GoogleProvider, AnthropicProvider, OpenAIProvider, CustomProvider.
- ProviderRegistry: Central provider registry.
- Exceptions: ModelFactoryError, MissingApiKeyError, MissingConfigurationError, UnsupportedProviderError.

All legacy test doubles and mock classes have been completely removed.
"""

from carefold.model.types import (
    ModelClient,
    ModelMessage,
    ModelStreamChunk,
    ModelToolCallChunk,
    ModelToolFunction,
    StreamChoice,
    StreamDelta,
)
from carefold.model.client import OpenAIModelClient
from carefold.model.factory import (
    DEFAULT_MODELS,
    MissingApiKeyError,
    MissingConfigurationError,
    ModelFactory,
    ModelFactoryError,
    PROVIDER_ALIASES,
    SUPPORTED_PROVIDERS,
    UnsupportedProviderError,
    create_chat_model,
    resolve_api_key,
    resolve_base_url,
)
from carefold.model.providers import (
    AnthropicProvider,
    BaseModelProvider,
    CustomProvider,
    GoogleProvider,
    OllamaProvider,
    OpenAIProvider,
    ProviderAuthenticationError,
    ProviderConfigurationError,
    ProviderError,
    ProviderRegistry,
    UnsupportedModelError,
)

__all__ = [
    # Factory & Registry
    "ModelFactory",
    "ProviderRegistry",
    "create_chat_model",
    # Factory Exceptions
    "ModelFactoryError",
    "MissingApiKeyError",
    "MissingConfigurationError",
    "UnsupportedProviderError",
    # Provider Base & Exceptions
    "BaseModelProvider",
    "ProviderError",
    "ProviderConfigurationError",
    "ProviderAuthenticationError",
    "UnsupportedModelError",
    # Concrete Provider Strategies
    "OllamaProvider",
    "GoogleProvider",
    "AnthropicProvider",
    "OpenAIProvider",
    "CustomProvider",
    # Configuration & Helpers
    "SUPPORTED_PROVIDERS",
    "PROVIDER_ALIASES",
    "DEFAULT_MODELS",
    "resolve_api_key",
    "resolve_base_url",
    # Legacy Types & Client (to be pruned in Milestone 5)
    "ModelClient",
    "ModelMessage",
    "ModelStreamChunk",
    "ModelToolCallChunk",
    "ModelToolFunction",
    "StreamChoice",
    "StreamDelta",
    "OpenAIModelClient",
]
