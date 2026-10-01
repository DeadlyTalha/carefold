"""Pytest configuration and shared fixtures."""

import os
from pathlib import Path
import shutil
import tempfile
import pytest
from fastapi.testclient import TestClient

from carefold.config import settings
from carefold.main import app
from tests.fixtures.fake_model import (
    FakeChatModel,
    FakeListChatModel,
    MockChatModel,
    MockModelClient,
)


@pytest.fixture(scope="session")
def repo_root() -> Path:
    """Returns repository root directory."""
    return Path(__file__).resolve().parent.parent.parent


@pytest.fixture
def temp_workspace(tmp_path: Path, repo_root: Path):
    """Sets up an isolated test workspace with agents, skills, attachments, and logs."""
    ws = tmp_path / "workspace"
    ws.mkdir(parents=True)

    # Copy bundled agents and skills from repo root if they exist
    repo_agents = repo_root / "agents"
    repo_skills = repo_root / "skills"

    if repo_agents.is_dir():
        shutil.copytree(repo_agents, ws / "agents")
    else:
        (ws / "agents").mkdir()

    if repo_skills.is_dir():
        shutil.copytree(repo_skills, ws / "skills")
    else:
        (ws / "skills").mkdir()

    (ws / "attachments").mkdir()
    (ws / "logs").mkdir()
    (ws / "workspace" / "notes").mkdir(parents=True)

    # Override settings for tests
    old_root = settings.workspace_root
    old_log = settings.audit_log_path
    old_store = settings.audit_store_bodies

    settings.workspace_root = ws
    settings.audit_log_path = ws / "logs" / "audit.jsonl"
    settings.audit_store_bodies = False

    yield ws

    settings.workspace_root = old_root
    settings.audit_log_path = old_log
    settings.audit_store_bodies = old_store


@pytest.fixture
def client(temp_workspace: Path) -> TestClient:
    """Returns a FastAPI TestClient configured with test workspace."""
    return TestClient(app)


@pytest.fixture
def mock_client() -> MockModelClient:
    """Returns a deterministic MockModelClient."""
    return MockModelClient()


@pytest.fixture
def fake_llm() -> FakeListChatModel:
    """Returns a deterministic LangChain FakeListChatModel."""
    return FakeListChatModel(responses=["Hello, I am a helpful clinical assistant."])


@pytest.fixture
def fake_chat_model() -> FakeChatModel:
    """Returns a configurable FakeChatModel."""
    return FakeChatModel()


@pytest.fixture(autouse=True)
def default_test_model_client(monkeypatch):
    """Provides a deterministic MockChatModel default when tests execute agent runs without a live LLM."""
    import carefold.engine.runner as runner_mod
    monkeypatch.setattr(runner_mod, "create_chat_model", lambda *args, **kwargs: MockChatModel())



