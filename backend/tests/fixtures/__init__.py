"""Carefold test fixtures package.

Houses test doubles, fake chat models, and mock client implementations:
- FakeListChatModel: Deterministic sequential response generation.
- FakeChatModel: Configurable mock chat model.
- MockChatModel: LangChain ChatModel implementation of Carefold rule-based mock.
- MockModelClient: Legacy ModelClient implementation for streaming tests.
"""

from tests.fixtures.fake_model import (
    FakeChatModel,
    FakeListChatModel,
    MockChatModel,
    MockModelClient,
    extract_text_from_content,
)

__all__ = [
    "FakeChatModel",
    "FakeListChatModel",
    "MockChatModel",
    "MockModelClient",
    "extract_text_from_content",
]
