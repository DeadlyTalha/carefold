# Project: Carefold Architectural Redesign

## Architecture
Carefold provides an intelligent, local-first clinical and health insurance navigation assistant.
The architectural redesign modernizes Carefold into SOLID-compliant, decoupled packages:
1. **`workflows/` Package (`backend/src/carefold/workflows/`)**:
   - `workflows/nodes/`: Class-based single-responsibility nodes implementing `BaseNode(ABC)` with `async def execute(self, state: AgentState) -> Dict[str, Any]`.
   - `workflows/subgraphs/`: Encapsulated LangGraph subgraphs for multi-agent supervisor and document extraction.
   - `workflows/state.py`: Comprehensive `AgentState` schema supporting routing, subgraphs, document dossiers, reflection counter, and tool traces.
2. **`workflows/subgraphs/extraction/` Subgraph**:
   - Sandboxed file ingestion (`attachments/`), PII sanitization (SSN, MRN, phone, address), typed Pydantic dossiers (`InsuranceBenefitsDossier`, `ClinicalVisitDossier`, `GenericDocumentDossier`), numerical grounding validator, and dual invocation (file upload + `extract_document_dossier` tool).
3. **`engine/` Package (`backend/src/carefold/engine/`)**:
   - `builder.py` (`GraphBuilder`): Assembles nodes, subgraphs, conditional routing, and SQLite checkpointer.
   - `service.py` (`AgentExecutionService`): Streaming execution service and thread manager.
   - `runner.py`: Streamlined delegation facade, legacy monolithic runtime eliminated.
4. **`model/` Package (`backend/src/carefold/model/`)**:
   - Strategy pattern: `BaseModelProvider` and concrete implementations (`OllamaProvider`, `GoogleProvider`, `AnthropicProvider`, `OpenAIProvider`, `CustomProvider`) under `model/providers/`.
   - `ModelFactory` / `ProviderRegistry` for dynamic resolution.
   - Zero production mock code: `model/mock.py` completely deleted, mock flags purged from `src/`, test doubles strictly in `tests/fixtures/` and `conftest.py`.
5. **`resources/` & `constants/` Packages**:
   - Zero hardcoded disclaimers, prompts, safety regexes, or magic values.
   - YAML resources in `resources/` (`disclaimers.yaml`, `refusal_patterns.yaml`, `prompts.yaml`, `errors.yaml`) loaded via cached `ResourceLoader`.
   - Constants in `constants/` (`api.py`, `models.py`, `defaults.py`, `paths.py`).
6. **Frontend UI (`apps/web/`)**:
   - Next.js 15 chat application verified with Model & Provider selector, Settings modal, AI suggestion chips, message hover action toolbar, live tool traces, and clean production build.

---

## Code Layout
```
agents/
├── _template/
├── benefits-guide/
├── habit-companion/
├── visit-steward/
├── orchestrator/
│   └── agent.yaml
└── document-extractor/
    └── agent.yaml

backend/src/carefold/
├── agents/
│   ├── __init__.py
│   └── registry.py
├── constants/
│   ├── __init__.py
│   ├── agents.py
│   ├── api.py
│   ├── defaults.py
│   ├── extraction.py
│   ├── models.py
│   └── paths.py
├── engine/
│   ├── __init__.py
│   ├── builder.py
│   ├── graph.py
│   ├── prompt_builder.py
│   ├── runner.py
│   └── service.py
├── model/
│   ├── __init__.py
│   ├── factory.py
│   └── providers/
│       ├── __init__.py
│       ├── anthropic_provider.py
│       ├── base.py
│       ├── custom_provider.py
│       ├── google_provider.py
│       ├── ollama_provider.py
│       └── openai_provider.py
├── resources/
│   ├── __init__.py
│   ├── disclaimers.yaml
│   ├── errors.yaml
│   ├── loader.py
│   ├── prompts.yaml
│   └── refusal_patterns.yaml
├── tools/
│   ├── __init__.py
│   ├── attachments.py
│   ├── delegation_tools.py
│   ├── extraction_tools.py
│   ├── registry.py
│   └── sandboxed.py
└── workflows/
    ├── __init__.py
    ├── state.py
    ├── nodes/
    │   ├── __init__.py
    │   ├── agent_execution_node.py
    │   ├── agent_node.py
    │   ├── audit_node.py
    │   ├── base.py
    │   ├── error_node.py
    │   ├── input_guardrail_node.py
    │   ├── orchestrator_node.py
    │   ├── output_guardrail_node.py
    │   ├── reflection_node.py
    │   ├── refusal_node.py
    │   ├── suggestion_node.py
    │   ├── supervisor_node.py
    │   ├── tool_node.py
    │   └── tool_validator_node.py
    └── subgraphs/
        ├── __init__.py
        ├── supervisor.py
        └── extraction/
            ├── __init__.py
            ├── dossiers.py
            ├── graph.py
            ├── grounding.py
            ├── sanitizer.py
            └── tool.py
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F-01 YAML Resource Loader | Cached singleton loader reading YAML resources from `resources/` | M1 | R6 |
| 2 | F-02 Disclaimers Resource | Externalized intended-use disclaimers and refusal notices in `disclaimers.yaml` | M1 | R6 |
| 3 | F-03 Refusal Patterns Resource | Externalized clinical safety regex patterns and keyword sets in `refusal_patterns.yaml` | M1 | R6 |
| 4 | F-04 Prompts Resource | Externalized supervisor, agent, and extraction prompts in `prompts.yaml` | M1 | R6 |
| 5 | F-05 Errors Resource | Standardized error messages and error payload schemas in `errors.yaml` | M1 | R6 |
| 6 | F-06 API Constants | Route paths, HTTP status codes, and SSE event constants in `constants/api.py` | M1 | R6 |
| 7 | F-07 Models Constants | Model names, provider identifiers, timeouts, and temperature defaults in `constants/models.py` | M1 | R6 |
| 8 | F-08 Defaults Constants | Pagination defaults, file limits, and retry thresholds in `constants/defaults.py` | M1 | R6 |
| 9 | F-09 Paths Constants | Root, resource, attachment, and database path constants in `constants/paths.py` | M1 | R6 |
| 10 | F-10 Safety Classifier Migration | Refactor `safety/classifier.py` and `safety/template.py` to use `ResourceLoader` and constants | M1 | R6 |
| 11 | F-11 Base Model Provider ABC | Abstract `BaseModelProvider` interface under `model/providers/base.py` | M2 | R4 |
| 12 | F-12 Ollama Provider | Concrete `OllamaProvider` strategy for local Ollama chat models | M2 | R4 |
| 13 | F-13 Google Gemini Provider | Concrete `GoogleProvider` strategy for Gemini models via `langchain-google-genai` | M2 | R4 |
| 14 | F-14 Anthropic Provider | Concrete `AnthropicProvider` strategy for Claude models via `langchain-anthropic` | M2 | R4 |
| 15 | F-15 OpenAI Provider | Concrete `OpenAIProvider` strategy for OpenAI models via `langchain-openai` | M2 | R4 |
| 16 | F-16 Custom Endpoint Provider | Concrete `CustomProvider` strategy for OpenAI-compatible local/remote endpoints | M2 | R4 |
| 17 | F-17 Model Factory & Registry | Dynamic provider resolution and model instantiation via `ModelFactory` / `ProviderRegistry` | M2 | R4 |
| 18 | F-18 Production Mock Purge | Complete deletion of `backend/src/carefold/model/mock.py` and removal of mock flags from `src/` | M2 | R5 |
| 19 | F-19 Test Doubles Relocation | Relocate test doubles to `backend/tests/fixtures/fake_model.py` and `conftest.py` using `FakeListChatModel` | M2 | R5 |
| 20 | F-20 AgentState Schema | Comprehensive TypedDict `AgentState` schema in `workflows/state.py` | M3 | R1 |
| 21 | F-21 BaseNode Interface | Abstract `BaseNode(ABC)` in `workflows/nodes/base.py` with `execute` contract | M3 | R1 |
| 22 | F-22 Input Guardrail Node | `InputGuardrailNode` evaluating clinical safety against refusal patterns | M3 | R1 |
| 23 | F-23 Supervisor Node | `SupervisorNode` intent classifier and routing dispatcher | M3 | R1 |
| 24 | F-24 Agent Node | `AgentNode` managing agent prompt assembly and model invocation | M3 | R1 |
| 25 | F-25 Tool Execution Node | `ToolNode` executing tools adhering to `union(agent.tools, skill.tools)` sandbox | M3 | R1 |
| 26 | F-26 Tool Validator Node | `ToolValidatorNode` output sanitizer and size/format validator | M3 | R1 |
| 27 | F-27 Output Guardrail Node | `OutputGuardrailNode` verifying output safety and compliance disclaimers | M3 | R1 |
| 28 | F-28 Reflection Node | `ReflectionNode` critic and self-correction loop capped by max retries | M3 | R1 |
| 29 | F-29 Refusal Node | `RefusalNode` standardized refusal disclaimer and response formatter | M3 | R1 |
| 30 | F-30 Suggestion Node | `SuggestionNode` AI follow-up next question generator | M3 | R1 |
| 31 | F-31 Audit Node | `AuditNode` zero-body audit event logger | M3 | R1 |
| 32 | F-32 Error Node | `ErrorNode` graceful error recovery and standardized response formatting | M3 | R1 |
| 33 | F-33 Specialist Supervisor Subgraph | `workflows/subgraphs/supervisor.py` multi-agent coordination graph | M3 | R1 |
| 34 | F-34 Sandboxed File Ingestion | Sandboxed reading of PDFs, text files, and tables in `attachments/` | M4 | R2 |
| 35 | F-35 PII Sanitizer | Automated masking of SSN, MRN, phone, address before external model calls | M4 | R2 |
| 36 | F-36 Structured Dossier Schemas | Pydantic schemas for `InsuranceBenefitsDossier`, `ClinicalVisitDossier`, `GenericDocumentDossier` | M4 | R2 |
| 37 | F-37 Grounding Validator | Verification that extracted numerical values match raw source text spans | M4 | R2 |
| 38 | F-38 Dual Invocation Extraction | Ingestion trigger on upload + `extract_document_dossier` tool populating `AgentState` | M4 | R2 |
| 39 | F-39 GraphBuilder Engine | `backend/src/carefold/engine/builder.py` assembling nodes, subgraphs, edges, and SqliteSaver | M5 | R3 |
| 40 | F-40 AgentExecutionService | `backend/src/carefold/engine/service.py` SSE streaming execution and thread management | M5 | R3 |
| 41 | F-41 Monolithic Runner Purge | Eliminate bloated logic from `engine/runner.py`, convert to lightweight delegation facade | M5 | R3 |
| 42 | F-42 Backend Codebase Cleanup | Prune dead imports, unused helpers, and obsolete `ModelClient` interfaces | M5 | R7 |
| 43 | F-43 Frontend Codebase Cleanup | Prune redundant types in `apps/web/src/lib/types.ts`, unused variables, ensure 0 TS diagnostics | M5 | R7 |
| 44 | F-44 Root Agents Manifests | `agents/orchestrator/agent.yaml` and `agents/document-extractor/agent.yaml` | M6 | Redesign |
| 45 | F-45 Extended AgentManifest | `can_delegate`, `max_iterations`, `description` on `AgentManifest` | M6 | Redesign |
| 46 | F-46 Declarative AgentRegistry | `carefold.agents.registry.AgentRegistry` wrapping `load_agent` with dynamic catalog | M6 | Redesign |
| 47 | F-47 LLM OrchestratorNode | Dynamic LLM `OrchestratorNode` using structured output, zero regex patterns | M6 | Redesign |
| 48 | F-48 Unified AgentExecutionNode | `AgentExecutionNode` loading agent persona and tools dynamically from registry | M6 | Redesign |
| 49 | F-49 Agent-Based Extraction Tools | LangChain tools (`sanitize_pii`, `extract_structured_data`, `validate_grounding`) replacing regex extractor | M6 | Redesign |
| 50 | F-50 Delegation Tools & Phase 0 | `delegate_to_agent`, `list_agents` tools, and updated `PHASE_0_REGISTRY` | M6 | Redesign |
| 51 | F-51 Extraction & Agent Constants | Externalize hardcoded strings to `constants/extraction.py` and `constants/agents.py` | M6 | Redesign |
| 52 | F-52 Final Acceptance & Golden Evals | 100% pass on all 4 tiers of E2E tests (295 tests), offline evals, and full pytest suite | M7 | Acceptance |
| 53 | F-53 Adversarial Hardening | Tier 5 adversarial stress testing and coverage hardening | M7 | Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | External Resources & Constants | `resources/*.yaml`, `ResourceLoader`, `constants/*.py`, refactor `safety/` | None | DONE |
| M2 | Provider Strategy & Mock Purge | `model/providers/*`, `ModelFactory`, delete `mock.py`, test doubles in `fixtures/` | M1 | DONE |
| M3 | Workflows Package & Discrete Nodes | `workflows/state.py`, `workflows/nodes/*` (BaseNode + 11 nodes), supervisor subgraph | M1, M2 | DONE |
| M4 | Document Extraction Subgraph | `workflows/subgraphs/extraction/` (ingestion, PII, dossiers, grounding, tool) | M3 | DONE |
| M5 | Streamlined Engine & Code Cleanup | `engine/builder.py`, `engine/service.py`, runner purge, backend/frontend cleanup | M4 | DONE |
| M6 | Orchestrator & Extraction Redesign | Dynamic LLM `OrchestratorNode`, `AgentExecutionNode`, `AgentRegistry`, extraction tools | M5 | DONE |
| M7 | Final Acceptance & Hardening | Pass E2E Tiers 1-4 (`TEST_READY.md`), evals, full pytest suite, Tier 5 hardening | M6, TEST_READY | DONE |

---

## Interface Contracts

### 1. `ResourceLoader` (`carefold.resources.loader`)
- `get_disclaimers() -> Dict[str, Any]`
- `get_refusal_patterns() -> Dict[str, Any]`
- `get_prompts() -> Dict[str, Any]`
- `get_errors() -> Dict[str, Any]`
- Cached singleton: `get_resource_loader() -> ResourceLoader`

### 2. `BaseModelProvider` (`carefold.model.providers.base`)
```python
class BaseModelProvider(ABC):
    @abstractmethod
    def create_model(self, model: str, temperature: float = 0.0, **kwargs: Any) -> BaseChatModel: ...
    @abstractmethod
    def get_supported_models(self) -> List[str]: ...
    @abstractmethod
    def validate_credentials(self) -> bool: ...
```

### 3. `ModelFactory` (`carefold.model.factory`)
- `ModelFactory.create_chat_model(provider: str, model: Optional[str] = None, api_key: Optional[str] = None, **kwargs: Any) -> BaseChatModel`
- Zero occurrences of `mock` parameter or mock returns.

### 4. `BaseNode` (`carefold.workflows.nodes.base`)
```python
class BaseNode(ABC):
    @abstractmethod
    async def execute(self, state: AgentState) -> Dict[str, Any]: ...
    async def __call__(self, state: AgentState) -> Dict[str, Any]:
        return await self.execute(state)
```

### 5. `AgentState` (`carefold.workflows.state`)
```python
class AgentState(TypedDict, total=False):
    messages: Annotated[List[BaseMessage], add_messages]
    thread_id: str
    user_id: str
    current_agent: str
    next_step: str
    routed_subgraph: Optional[str]
    document_dossiers: List[Dict[str, Any]]
    tool_traces: List[Dict[str, Any]]
    reflection_count: int
    max_reflections: int
    is_refusal: bool
    refusal_reason: Optional[str]
    safety_metadata: Dict[str, Any]
    follow_up_suggestions: List[str]
    error: Optional[str]
```

### 6. Document Dossiers (`carefold.workflows.subgraphs.extraction.dossiers`)
- `InsuranceBenefitsDossier(BaseModel)`: copays, deductibles, coinsurance, in_out_network_rules, prior_authorization_flags.
- `ClinicalVisitDossier(BaseModel)`: reason_for_visit, physician_instructions, follow_up_timeline, questions_to_ask.
- `GenericDocumentDossier(BaseModel)`: summary, key_numerical_values, sections.
- `GroundingValidator.validate(dossier: BaseModel, raw_text: str) -> GroundingValidationResult`.

### 7. Engine Builder & Service (`carefold.engine`)
- `GraphBuilder`:
  - `build_graph(model: BaseChatModel, checkpointer: Optional[BaseCheckpointSaver] = None) -> CompiledGraph`
- `AgentExecutionService`:
  - `execute_chat(request: ChatRequest) -> AsyncIterator[ServerSentEvent]`
  - `get_thread_state(thread_id: str) -> Optional[AgentState]`
