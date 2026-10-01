# E2E Test Infrastructure Specification: Carefold Architectural Redesign

## 1. Test Philosophy

- **Opaque-Box & Requirement-Driven**: The end-to-end (E2E) test suite is derived strictly from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and the architectural interface contracts. Tests evaluate observable behaviors, external REST/SSE APIs, data schemas, refusal rules, dossier extractions, provider configurations, and error contracts without coupling to private implementation trivia.
- **Methodology**: Combines Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Realistic Workload Simulations across four distinct testing tiers (Tiers 1–4).
- **Progressive Testability**: Tests are designed to verify contracts deterministically. During milestone progression (M1 through M6), tests provide clear diagnostic assertions and milestone-aware validation, ensuring that test suites remain executable, collectible, and informative as features land across packages (`resources`, `constants`, `model/providers`, `workflows`, `engine`).
- **Zero Mock Cheats in Production**: Strict adherence to Requirement R5. No production mock bypass logic or `model/mock.py` exists in production code; all test doubles utilize deterministic LangChain-compatible fixtures (`FakeListChatModel`) strictly isolated to `backend/tests/fixtures/` and test `conftest.py`.

---

## 2. The 4 Testing Tiers

### Tier 1: Feature Coverage (≥5 Test Cases per Feature for F-01 through F-43)
Every single feature in the `PROJECT.md` Feature Inventory (F-01 through F-43) has a minimum of 5 dedicated, distinct test cases covering:
1. Primary happy path behavior.
2. Contractual input validation.
3. Expected output format and schema adherence.
4. Error condition handling or fallback.
5. Immutability, caching, isolation, or boundary integrity.

**Target Count**: 43 features × 5 cases = **≥ 215 test cases**.

### Tier 2: Boundary & Corner Cases (≥5 Test Cases per Boundary Domain)
Stress tests boundary conditions, extreme limits, and corner cases across all subsystems where thresholds exist:
- **File Upload Limits**: Exact 10MB (10,485,760 bytes), 10MB + 1 byte (rejected), 0-byte empty file, missing file extensions, oversized buffers.
- **Reflection Loop Ceilings**: Retries below threshold (`retry_count < max_retries`), exact ceiling (`retry_count == max_retries` triggers termination), negative retries.
- **Temperature & Model Parameters**: Boundary temperatures (0.0 deterministic, 1.0, 2.0 max, out-of-bounds rejection).
- **String Length & ReDoS Resistance**: Very long strings (10,000+ characters), nested parentheses, repetitive medical tokens tested for linear runtime (<10ms) without catastrophic backtracking.
- **PII Masking Boundaries**: Adjacent identifiers (SSN immediately followed by MRN), unhyphenated 9-digit numbers, international phone formats, partial address matches.
- **Grounding Numerical Tolerances**: Exact numerical match, zero dollar amounts ($0 copay), 7-figure amounts ($1,000,000), percentage coinsurance (20%), mismatched amounts detected.
- **Path Traversal & Sandbox Isolation**: Relative traversal (`../../`), absolute root paths (`/etc/passwd`), null-byte injection (`%00`), URL-encoded slashes, symlink escapes.
- **Schema Validation Corner Cases**: Negative copay numbers, missing mandatory fields, extra undeclared keys, empty text inputs.
- **SSE Streaming Boundaries**: Empty text chunk deltas, multi-chunk fragmentation, rapid client disconnect.
- **Tool Output Size Bounds**: Output exactly at limit, limit + 1 byte truncation, empty tool output handling.

**Target Count**: 12 boundary categories × 5 cases = **≥ 60 test cases**.

### Tier 3: Cross-Feature Combinations (Pairwise & Multi-Feature Interactions)
Validates integration contracts and data flow across architectural package boundaries:
1. `InputGuardrailNode` + `RefusalNode` + `AuditNode`: Unsafe clinical prompt detected -> Refusal formatted -> Zero-body audit log written.
2. `ModelFactory` + `BaseModelProvider` + `AgentNode`: Dynamic provider resolution -> Chat model created -> Agent prompt assembled & model executed.
3. `Sandboxed File Ingestion` + `PII Sanitizer` + `Dossier Extraction`: File read from `attachments/` -> Direct identifiers masked -> Typed dossier extracted.
4. `Dossier Extraction` + `Grounding Validator` + `AgentState`: Pydantic dossier generated -> Grounding checks numerical values against raw text -> Dossier stored in state.
5. `SupervisorNode` + `Specialist Subgraph` + `State Propagation`: User intent classified -> Routed to specialist agent (`visit-steward` or `benefits-guide`) -> State propagated to subgraph.
6. `ToolNode` + `ToolValidatorNode` + `Tool Traces`: Agent invokes tool -> Output sanitized and validated -> Tool execution trace appended to `AgentState`.
7. `OutputGuardrailNode` + `ReflectionNode` + Self-Correction: Ungrounded output detected -> Output guardrail flags violation -> Reflection node triggers self-correction loop.
8. `Reflection Loop Limit` + `Graceful Fallback`: Reflection count reaches maximum -> Self-correction halted -> Safe response emitted without infinite recursion.
9. `Dual Invocation Tool` + `Specialist Agent` + `AgentState`: Specialist agent calls `extract_document_dossier` tool -> Subgraph executed on demand -> State updated.
10. `ResourceLoader` + `Safety Classifier` + `REST Chat API`: YAML patterns loaded -> Safety classifier initialized -> Incoming `/api/chat` request evaluated.
11. `ErrorNode` + `SSE Streaming Service` + `Audit Logging`: Node raises runtime exception -> Error node formats standardized event -> SSE stream emits error -> Audit records failure without leaking sensitive body.
12. `SQLite Checkpointer` + `AgentExecutionService` + Multi-Turn Thread: Thread initialized -> State persisted in SQLite checkpointer -> Subsequent turn resumes state.
13. `API Constants` + `Defaults Constants` + `Engine Builder`: Builder configures graph using centralized route, timeout, and retry constants.
14. `PII Sanitizer` + `Tool Execution` + `Audit Redaction`: Sensitive tool output masked before logging; zero-body privacy maintained.
15. `Frontend Contract` + `Backend SSE Contract`: Event types emitted by service match Next.js UI parser expectations.

**Target Count**: **≥ 15 interaction test cases**.

### Tier 4: Real-World Application Scenarios (End-to-End Workflows)
Full lifecycle user journey workflows simulating genuine clinical and insurance navigation scenarios:
1. **Scenario 1: Comprehensive Patient Pre-Visit Clinical Preparation**:
   User uploads prior visit summary attachment -> Sandboxed Ingestion reads text -> PII Sanitizer masks patient identifiers -> `ClinicalVisitDossier` extracted & grounded -> Supervisor routes to `visit-steward` -> Agent generates doctor questions -> SuggestionNode adds follow-up chips -> AuditNode logs zero-body execution.
2. **Scenario 2: Complex Health Insurance Benefits & Prior Authorization Verification**:
   User queries insurance policy coverage for physical therapy -> Ingestion extracts `InsuranceBenefitsDossier` -> Copays, deductibles, and prior authorization flags parsed -> Supervisor routes to `benefits-guide` -> OutputGuardrail attaches compliance disclaimer -> Tool traces verify `attach-read` execution.
3. **Scenario 3: Severe Clinical Emergency Refusal & Safe Redirection**:
   User reports acute chest pain and asks whether to skip 911 -> InputGuardrail flags clinical triage diversion -> Supervisor bypassed -> RefusalNode generates urgent emergency notice -> Zero-body audit log recorded -> SuggestionNode suppresses non-emergency chips.
4. **Scenario 4: Multi-Turn Navigation Journey Across Specialist Domains**:
   User begins with visit preparation (Turn 1: `visit-steward`) -> Shifts context to billing & copays (Turn 2: `benefits-guide`) -> SQLite checkpointer retains cross-turn state -> Supervisor dynamically re-routes -> Both dossiers preserved in thread history.
5. **Scenario 5: Malformed Attachment & Sandboxed Error Recovery**:
   User uploads an oversized or corrupted attachment -> Sandboxed Ingestion / ToolValidator intercepts violation -> ErrorNode catches failure gracefully -> Standardized user-friendly error returned via SSE -> Audit records error without crash -> System remains ready for subsequent prompt.

**Target Count**: **≥ 5 realistic application scenarios**.

---

## 3. Feature Inventory & Test Coverage Matrix (F-01 through F-43)

| Feature ID | Feature Name | Package / Location | Tier 1 (>=5) | Tier 2 (>=5) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|:----------:|:-------------|:-------------------|:------------:|:------------:|:-----------------:|:-----------------:|
| **F-01** | YAML Resource Loader | `carefold.resources.loader` | 5 | 5 | ✓ | ✓ |
| **F-02** | Disclaimers Resource | `resources/disclaimers.yaml` | 5 | — | ✓ | ✓ |
| **F-03** | Refusal Patterns Resource | `resources/refusal_patterns.yaml` | 5 | 5 | ✓ | ✓ |
| **F-04** | Prompts Resource | `resources/prompts.yaml` | 5 | — | ✓ | ✓ |
| **F-05** | Errors Resource | `resources/errors.yaml` | 5 | 5 | ✓ | ✓ |
| **F-06** | API Constants | `carefold.constants.api` | 5 | — | ✓ | ✓ |
| **F-07** | Models Constants | `carefold.constants.models` | 5 | 5 | ✓ | — |
| **F-08** | Defaults Constants | `carefold.constants.defaults` | 5 | 5 | ✓ | ✓ |
| **F-09** | Paths Constants | `carefold.constants.paths` | 5 | 5 | ✓ | ✓ |
| **F-10** | Safety Classifier Migration | `carefold.safety.classifier` | 5 | 5 | ✓ | ✓ |
| **F-11** | Base Model Provider ABC | `carefold.model.providers.base` | 5 | — | ✓ | — |
| **F-12** | Ollama Provider | `carefold.model.providers.ollama_provider` | 5 | 5 | ✓ | — |
| **F-13** | Google Gemini Provider | `carefold.model.providers.google_provider` | 5 | 5 | ✓ | — |
| **F-14** | Anthropic Provider | `carefold.model.providers.anthropic_provider` | 5 | 5 | ✓ | — |
| **F-15** | OpenAI Provider | `carefold.model.providers.openai_provider` | 5 | 5 | ✓ | — |
| **F-16** | Custom Endpoint Provider | `carefold.model.providers.custom_provider` | 5 | 5 | ✓ | — |
| **F-17** | Model Factory & Registry | `carefold.model.factory` | 5 | 5 | ✓ | ✓ |
| **F-18** | Production Mock Purge | `carefold.model.mock` purge | 5 | — | ✓ | — |
| **F-19** | Test Doubles Relocation | `backend/tests/fixtures/`, `conftest.py` | 5 | — | ✓ | ✓ |
| **F-20** | AgentState Schema | `carefold.workflows.state` | 5 | 5 | ✓ | ✓ |
| **F-21** | BaseNode Interface | `carefold.workflows.nodes.base` | 5 | — | ✓ | — |
| **F-22** | Input Guardrail Node | `carefold.workflows.nodes.input_guardrail_node` | 5 | 5 | ✓ | ✓ |
| **F-23** | Supervisor Node | `carefold.workflows.nodes.supervisor_node` | 5 | — | ✓ | ✓ |
| **F-24** | Agent Node | `carefold.workflows.nodes.agent_node` | 5 | — | ✓ | ✓ |
| **F-25** | Tool Execution Node | `carefold.workflows.nodes.tool_node` | 5 | 5 | ✓ | ✓ |
| **F-26** | Tool Validator Node | `carefold.workflows.nodes.tool_validator_node` | 5 | 5 | ✓ | ✓ |
| **F-27** | Output Guardrail Node | `carefold.workflows.nodes.output_guardrail_node` | 5 | 5 | ✓ | ✓ |
| **F-28** | Reflection Node | `carefold.workflows.nodes.reflection_node` | 5 | 5 | ✓ | ✓ |
| **F-29** | Refusal Node | `carefold.workflows.nodes.refusal_node` | 5 | — | ✓ | ✓ |
| **F-30** | Suggestion Node | `carefold.workflows.nodes.suggestion_node` | 5 | 5 | ✓ | ✓ |
| **F-31** | Audit Node | `carefold.workflows.nodes.audit_node` | 5 | 5 | ✓ | ✓ |
| **F-32** | Error Node | `carefold.workflows.nodes.error_node` | 5 | 5 | ✓ | ✓ |
| **F-33** | Specialist Supervisor Subgraph | `carefold.workflows.subgraphs.supervisor` | 5 | — | ✓ | ✓ |
| **F-34** | Sandboxed File Ingestion | `carefold.workflows.subgraphs.extraction` | 5 | 5 | ✓ | ✓ |
| **F-35** | PII Sanitizer | `carefold.workflows.subgraphs.extraction.sanitizer` | 5 | 5 | ✓ | ✓ |
| **F-36** | Structured Dossier Schemas | `carefold.workflows.subgraphs.extraction.dossiers` | 5 | 5 | ✓ | ✓ |
| **F-37** | Grounding Validator | `carefold.workflows.subgraphs.extraction.grounding` | 5 | 5 | ✓ | ✓ |
| **F-38** | Dual Invocation Extraction | `carefold.workflows.subgraphs.extraction.tool` | 5 | 5 | ✓ | ✓ |
| **F-39** | GraphBuilder Engine | `carefold.engine.builder` | 5 | — | ✓ | ✓ |
| **F-40** | AgentExecutionService | `carefold.engine.service` | 5 | 5 | ✓ | ✓ |
| **F-41** | Monolithic Runner Purge | `carefold.engine.runner` facade | 5 | — | ✓ | — |
| **F-42** | Backend Codebase Cleanup | Backend cleanliness audit | 5 | — | ✓ | — |
| **F-43** | Frontend Codebase Cleanup | Frontend types & builds | 5 | — | ✓ | — |
| **TOTALS** | | | **215** | **60** | **15** | **5** |

**Grand Total E2E Target**: **295 Test Cases**.

---

## 4. Test Directory Architecture

```
backend/tests/e2e/
├── __init__.py
├── conftest.py                   # E2E test fixtures, deterministic FakeListChatModel, isolated workspaces
├── test_tier1_features.py        # 215 tests covering F-01 through F-43 (5 tests each)
├── test_tier2_boundaries.py      # 60 tests covering edge conditions, BVA, ReDoS, and sandbox bounds
├── test_tier3_interactions.py    # 15 tests covering pairwise cross-feature module interactions
└── test_tier4_scenarios.py       # 5 comprehensive real-world patient and insurance workflows
```

---

## 5. Execution & Verification Commands

### Standard Test Collection (Verification of Syntax and Import Integrity)
```bash
backend/.venv/bin/pytest backend/tests/e2e/ --collect-only
```

### Full E2E Test Execution
```bash
backend/.venv/bin/pytest backend/tests/e2e/ -v
```

### Targeted Tier Execution
```bash
backend/.venv/bin/pytest backend/tests/e2e/test_tier1_features.py -v
backend/.venv/bin/pytest backend/tests/e2e/test_tier2_boundaries.py -v
backend/.venv/bin/pytest backend/tests/e2e/test_tier3_interactions.py -v
backend/.venv/bin/pytest backend/tests/e2e/test_tier4_scenarios.py -v
```
