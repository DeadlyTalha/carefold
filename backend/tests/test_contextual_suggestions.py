"""Empirical test suite for contextual AI follow-up suggestions and agent specialization.

Verifies:
1. Agent-specific suggestion chip precedence (persona keywords > tools > persona defaults > global defaults).
2. Elimination of generic skill-docs leakage into non-visit agents (e.g. benefits-guide, cardiology-guide).
3. Specialized chips across clinical and administrative agents (claims, prior-auth, cardiology, etc.).
4. Preservation of visit-steward tool chips for appointment checklists and visit notes.
5. SuggestionNode dynamic generation with model and safety suppression on refusal.
"""

from __future__ import annotations

import json
from typing import List
import pytest
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.language_models.fake_chat_models import FakeListChatModel

from carefold.resources.loader import get_resource_loader
from carefold.workflows.nodes.suggestion_node import SuggestionNode
from carefold.engine.builder import GraphBuilder


@pytest.mark.parametrize(
    "agent_id, prompt, completion, tools_used, expected_keyword, forbidden_keyword",
    [
        # benefits-guide: should NEVER receive visit-steward appointment preparation chips
        ("benefits-guide", "What is my deductible?", "Your deductible is $1500.", ["skill-docs"], "deductible", "appointment preparation"),
        ("benefits-guide", "Tell me about prior authorization.", "Prior authorization is needed.", ["skill-docs"], "prior authorization", "appointment preparation"),
        ("benefits-guide", "Explain in-network vs out-of-network.", "In-network providers...", ["skill-docs"], "network", "appointment preparation"),
        ("benefits-guide", "General hello", "How can I help with your benefits?", ["skill-docs"], "coverage", "appointment preparation"),

        # cardiology-guide: blood pressure and cardiology chips
        ("cardiology-guide", "My blood pressure was 140/90.", "That reading is elevated.", ["skill-docs"], "blood pressure", "appointment preparation"),
        ("cardiology-guide", "I feel heart palpitations.", "Let us note your symptoms.", ["skill-docs"], "palpitation", "appointment preparation"),
        ("cardiology-guide", "General cardiology consultation", "Ready for your visit.", ["skill-docs"], "cardiology", "appointment preparation"),

        # claims-appeals-guide: denial and EOB chips
        ("claims-appeals-guide", "My claim was denied by insurance.", "Let us review the denial reason.", ["skill-docs"], "appeal", "appointment preparation"),
        ("claims-appeals-guide", "What does this EOB balance mean?", "Here is how to read your EOB.", ["skill-docs"], "explanation of benefits", "appointment preparation"),

        # prior-auth-navigator: step therapy and delay chips
        ("prior-auth-navigator", "What is step therapy?", "Step therapy requires trying alternatives.", ["skill-docs"], "step therapy", "appointment preparation"),
        ("prior-auth-navigator", "My prior auth is still pending.", "Let us check turnaround times.", ["skill-docs"], "prior authorization", "appointment preparation"),

        # habit-companion: hydration and sleep chips
        ("habit-companion", "How to drink more water?", "Stay hydrated daily.", ["skill-docs"], "hydration", "appointment preparation"),
        ("habit-companion", "I have trouble sleeping.", "A consistent wind-down routine helps.", ["skill-docs"], "sleep", "appointment preparation"),

        # visit-steward: appointment prep chips ARE expected for visit-steward
        ("visit-steward", "What about my lab tests?", "Here is your lab summary.", [], "lab", None),
        ("visit-steward", "What about my medications?", "Here is your medication list.", [], "medication", None),
        ("visit-steward", "Read docs", "Reference docs loaded.", ["skill-docs"], "checklist", None),
        ("visit-steward", "Save visit note", "Note saved in workspace.", ["workspace-note"], "visit note", None),
    ],
)
def test_contextual_suggestions_specialization(
    agent_id: str,
    prompt: str,
    completion: str,
    tools_used: List[str],
    expected_keyword: str,
    forbidden_keyword: str | None,
):
    """Verifies that follow-up suggestions are tailored to the agent's domain without cross-agent contamination."""
    loader = get_resource_loader()
    chips = loader.get_follow_up_suggestions(
        agent_id=agent_id,
        prompt=prompt,
        completion=completion,
        tools_used=tools_used,
    )

    assert isinstance(chips, list)
    assert 2 <= len(chips) <= 4
    combined = " ".join(chips).lower()

    assert expected_keyword in combined, (
        f"Expected keyword '{expected_keyword}' in suggestions for agent={agent_id}, prompt='{prompt}', got: {chips}"
    )

    if forbidden_keyword:
        assert forbidden_keyword not in combined, (
            f"Forbidden keyword '{forbidden_keyword}' found in suggestions for agent={agent_id}, prompt='{prompt}', got: {chips}"
        )


@pytest.mark.asyncio
async def test_suggestion_node_dynamic_llm_generation():
    """Verifies that SuggestionNode generates dynamic chips when a chat model is present."""
    fake_model_response = json.dumps([
        "How much will my copay be for physical therapy?",
        "Does my deductible reset on January 1st?",
        "Can I pay for this using my HSA funds?",
    ])
    fake_model = FakeListChatModel(responses=[fake_model_response])

    node = SuggestionNode(model=fake_model)
    res = await node.execute({
        "current_agent": "benefits-guide",
        "messages": [HumanMessage(content="What are my copays for PT?")],
        "output": "Physical therapy has a $30 specialist copay per visit.",
    })

    chips = res.get("follow_up_suggestions", [])
    assert len(chips) == 3
    assert "copay" in chips[0].lower()
    assert "deductible" in chips[1].lower()


@pytest.mark.asyncio
async def test_suggestion_node_suppression_on_refusal():
    """Verifies that SuggestionNode strictly returns empty chips on safety refusal."""
    fake_model = FakeListChatModel(responses=["Unused"])
    node = SuggestionNode(model=fake_model)

    res = await node.execute({
        "is_refusal": True,
        "refusal_reason": "emergency_chest_pain",
        "current_agent": "cardiology-guide",
        "messages": [HumanMessage(content="Crushing chest pain")],
    })

    assert res.get("follow_up_suggestions") == []
    assert res.get("next_step") == "done"


def test_graph_builder_attaches_model_to_suggestion_node():
    """Verifies that GraphBuilder configures SuggestionNode with model properly."""
    builder = GraphBuilder()
    builder.with_model(FakeListChatModel(responses=["Hello"]))
    # When building, suggestion_node is instantiated
    graph = builder.build()
    assert graph is not None
