"""Unit and adversarial tests for Phase 0 closed tools sandbox."""

import os
from pathlib import Path
import pytest

from carefold.schemas.manifest import AgentManifest
from carefold.tools.attach_read import execute_attach_read
from carefold.tools.sandbox import SandboxSecurityError, resolve_sandboxed_path
from carefold.tools.skill_docs import execute_skill_docs
from carefold.tools.workspace_note import execute_workspace_note


class MockContext:
    def __init__(self, workspace_root: Path, agent: AgentManifest):
        self.workspace_root = workspace_root
        self.skills_dir = workspace_root / "skills"
        self.agent = agent


@pytest.mark.asyncio
async def test_attach_read_text_success(temp_workspace: Path):
    attachments_dir = temp_workspace / "attachments"
    test_file = attachments_dir / "blood_work.txt"
    test_file.write_text("WBC: 6.5, Hemoglobin: 14.2", encoding="utf-8")

    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))
    result = await execute_attach_read({"path": "blood_work.txt"}, ctx)

    assert result.success is True
    assert result.output["format"] == "text"
    assert "WBC: 6.5" in result.output["content"]


@pytest.mark.asyncio
async def test_attach_read_pdf_success(temp_workspace: Path):
    attachments_dir = temp_workspace / "attachments"
    pdf_file = attachments_dir / "summary.pdf"
    # Simple valid synthetic PDF with a BT ... (Sample Clinical Note) Tj ... ET text layer
    pdf_bytes = (
        b"%PDF-1.4\n1 0 obj\n<< /Length 44 >>\nstream\n"
        b"BT\n/F1 12 Tf\n(Sample Clinical Note) Tj\nET\nendstream\nendobj\n"
        b"xref\n0 2\n0000000000 65535 f\n0000000010 00000 n\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    )
    pdf_file.write_bytes(pdf_bytes)

    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))
    result = await execute_attach_read({"path": "summary.pdf"}, ctx)

    assert result.success is True
    assert result.output["format"] == "pdf"
    assert "Sample Clinical Note" in result.output["content"]


@pytest.mark.asyncio
async def test_attach_read_adversarial_traversal(temp_workspace: Path):
    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))

    # Traversal via ../
    result1 = await execute_attach_read({"path": "../../etc/passwd"}, ctx)
    assert result1.success is False
    assert "Path traversal forbidden" in result1.error

    # Absolute path escape
    result2 = await execute_attach_read({"path": "/etc/passwd"}, ctx)
    assert result2.success is False
    assert "Path traversal forbidden" in result2.error

    # Null byte attack
    result3 = await execute_attach_read({"path": "blood_work.txt\0.pdf"}, ctx)
    assert result3.success is False
    assert "Null byte detected" in result3.error

    # URI protocol attack
    result4 = await execute_attach_read({"path": "file:///etc/passwd"}, ctx)
    assert result4.success is False
    assert "URI schemes are not permitted" in result4.error


@pytest.mark.asyncio
async def test_attach_read_adversarial_symlink_escape(temp_workspace: Path, tmp_path: Path):
    # Create external target file outside sandbox
    external_secret = tmp_path / "secret.txt"
    external_secret.write_text("TOP SECRET CLASSIFIED", encoding="utf-8")

    attachments_dir = temp_workspace / "attachments"
    symlink_file = attachments_dir / "evil_symlink.txt"

    try:
        os.symlink(external_secret, symlink_file)
    except OSError:
        pytest.skip("Symlink creation not supported on platform")

    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))
    result = await execute_attach_read({"path": "evil_symlink.txt"}, ctx)

    # Symlink escaping sandbox must be rejected
    assert result.success is False
    assert "escapes" in result.error.lower()


@pytest.mark.asyncio
async def test_workspace_note_success(temp_workspace: Path):
    ctx = MockContext(temp_workspace, AgentManifest(id="visit-steward", title="Visit Steward", persona="Role"))
    result = await execute_workspace_note(
        {"title": "Appointment Goals", "content": "1. Ask about lab tests\n2. Discuss knee pain"},
        ctx,
    )

    assert result.success is True
    assert result.output["title"] == "appointment-goals"
    assert result.output["filename"] == "appointment-goals.md"
    assert result.output["path"] == "workspace/notes/appointment-goals.md"
    assert result.output["full_path"] == str((temp_workspace / "workspace" / "notes" / "appointment-goals.md").resolve())
    assert result.output["absolute_path"] == result.output["full_path"]

    notes_dir = temp_workspace / "workspace" / "notes"
    saved_note = notes_dir / "appointment-goals.md"
    assert saved_note.is_file()

    content = saved_note.read_text(encoding="utf-8")
    assert "title: \"appointment-goals\"" in content
    assert "agent_id: \"visit-steward\"" in content
    assert "1. Ask about lab tests" in content


@pytest.mark.asyncio
async def test_workspace_note_symlink_overwrite_attack(temp_workspace: Path, tmp_path: Path):
    # Create external file that attacker wants to overwrite
    victim_file = tmp_path / "victim_important.txt"
    victim_file.write_text("ORIGINAL SENSITIVE CONTENT", encoding="utf-8")

    notes_dir = temp_workspace / "workspace" / "notes"
    notes_dir.mkdir(parents=True, exist_ok=True)
    symlink_note = notes_dir / "poison-note.md"

    try:
        os.symlink(victim_file, symlink_note)
    except OSError:
        pytest.skip("Symlink creation not supported on platform")

    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))
    result = await execute_workspace_note(
        {"title": "poison-note", "content": "MALICIOUS OVERWRITE CONTENT"},
        ctx,
    )

    assert result.success is False
    assert "is a symlink escaping sandbox" in result.error or "is an existing symlink" in result.error
    # Victim file must NOT be overwritten!
    assert victim_file.read_text(encoding="utf-8") == "ORIGINAL SENSITIVE CONTENT"


@pytest.mark.asyncio
async def test_workspace_note_symlink_overwrite_attack_internal(temp_workspace: Path):
    """Internal symlink pointing to another note in workspace must be rejected without overwriting target note."""
    notes_dir = temp_workspace / "workspace" / "notes"
    notes_dir.mkdir(parents=True, exist_ok=True)

    internal_victim = notes_dir / "confidential_doctor_note.md"
    internal_victim.write_text("CONFIDENTIAL DOCTOR INSTRUCTIONS - DO NOT ALTER", encoding="utf-8")

    symlink_internal = notes_dir / "shortcut_note.md"
    try:
        os.symlink(internal_victim, symlink_internal)
    except OSError:
        pytest.skip("Symlink creation not supported on platform")

    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))
    result = await execute_workspace_note(
        {"title": "shortcut_note", "content": "MALICIOUS OVERWRITE CONTENT"},
        ctx,
    )

    assert result.success is False
    assert "is an existing symlink" in result.error
    assert internal_victim.read_text(encoding="utf-8") == "CONFIDENTIAL DOCTOR INSTRUCTIONS - DO NOT ALTER"


@pytest.mark.asyncio
async def test_workspace_note_symlink_dangling_rejection(temp_workspace: Path):
    """Writing through a dangling symlink inside notes directory must be rejected."""
    notes_dir = temp_workspace / "workspace" / "notes"
    notes_dir.mkdir(parents=True, exist_ok=True)

    target_nonexistent = notes_dir / "target_never_existed.md"
    dangling_symlink = notes_dir / "dangling_link.md"
    try:
        os.symlink(target_nonexistent, dangling_symlink)
    except OSError:
        pytest.skip("Symlink creation not supported on platform")

    ctx = MockContext(temp_workspace, AgentManifest(id="test-agent", title="Test", persona="Role"))
    result = await execute_workspace_note(
        {"title": "dangling_link", "content": "MALICIOUS DANGLING OVERWRITE"},
        ctx,
    )

    assert result.success is False
    assert "is an existing symlink" in result.error
    assert not target_nonexistent.exists()


@pytest.mark.asyncio
async def test_skill_docs_success(temp_workspace: Path):
    ctx = MockContext(
        temp_workspace,
        AgentManifest(id="visit-steward", title="Visit Steward", skills=["visit-prep"], persona="Role"),
    )

    result = await execute_skill_docs(
        {"skill_id": "visit-prep", "doc": "checklist.md"},
        ctx,
    )

    assert result.success is True
    assert result.output["skill_id"] == "visit-prep"
    assert result.output["doc"] == "checklist.md"
    assert "Checklist" in result.output["content"]


@pytest.mark.asyncio
async def test_skill_docs_fail_closed_unauthorized_skill(temp_workspace: Path):
    # Agent only declares habit-checkin, not visit-prep
    ctx = MockContext(
        temp_workspace,
        AgentManifest(id="habit-companion", title="Habit Companion", skills=["habit-checkin"], persona="Role"),
    )

    result = await execute_skill_docs(
        {"skill_id": "visit-prep", "doc": "checklist.md"},
        ctx,
    )

    assert result.success is False
    assert "Access denied" in result.error
    assert "not declared" in result.error


@pytest.mark.asyncio
async def test_skill_docs_adversarial_traversal(temp_workspace: Path):
    ctx = MockContext(
        temp_workspace,
        AgentManifest(id="visit-steward", title="Visit Steward", skills=["visit-prep"], persona="Role"),
    )

    # Path traversal in doc name
    result = await execute_skill_docs(
        {"skill_id": "visit-prep", "doc": "../../carefold.yaml"},
        ctx,
    )
    assert result.success is False
    assert "Path traversal forbidden" in result.error

    # Path traversal in skill_id
    result2 = await execute_skill_docs(
        {"skill_id": "../evil", "doc": "checklist.md"},
        ctx,
    )
    assert result2.success is False
    assert "Invalid skill_id" in result2.error
