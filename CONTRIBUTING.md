# Contributing to Carefold

Thank you for your interest in contributing to Carefold! Carefold is an open-source, local-first healthcare AI agent marketplace and runtime built with Spector standards.

By contributing to this repository, you help make healthcare navigation and clinical visit preparation more private, accessible, and reliable.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to the [Carefold Code of Conduct](CODE_OF_CONDUCT.md) (Contributor Covenant v2.1). Please review it before participating.

---

## Development Setup

### Prerequisites

- **Node.js**: `v22.x` LTS or newer (required by `engines.node >=22.0.0`)
- **pnpm**: `v9.x` or higher
- **Python**: `3.12` or `3.14`
- **Git**: Configured with your real name and email for DCO signing
- **Ollama** (optional, recommended for local inference): [ollama.com](https://ollama.com) with `llama3.2` or `mistral` pulled

### Initial Repository Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/spectrayan/carefold.git
   cd carefold
   ```

2. **Install Node dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up the Python backend virtual environment**:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -e .
   pip install -r requirements-dev.txt
   cd ..
   ```

4. **Environment Variables** (optional):
   All backend settings have local-first defaults. To override them, copy the root `.env.example` to `.env` (the backend reads `.env` from the directory it is started in, so start it from the repository root). See the [Configuration Reference](docs/getting-started/configuration.md) for every `CAREFOLD_*` setting. Cloud model provider keys (`GOOGLE_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) are read from your shell environment.
   ```bash
   cp .env.example .env
   ```

5. **Start local services**:
   ```bash
   # Terminal 1: Backend API (run from the repository root)
   source backend/.venv/bin/activate
   uvicorn carefold.main:app --reload --port 8000

   # Terminal 2: Next.js Frontend
   pnpm --filter web dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contribution Workflow

### 1. Developer Certificate of Origin (DCO)

Carefold requires the Developer Certificate of Origin (DCO) sign-off on all commits. By adding a `Signed-off-by:` line, you certify that you wrote the code or have the right to submit it under the Apache-2.0 license.

To sign your commit automatically:
```bash
git commit -s -m "feat(orchestrator): add fallback routing node"
```

### 2. Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or specialist agent
- `fix:` A bug fix or guardrail patch
- `docs:` Documentation additions or updates
- `style:` Formatting changes that do not affect code logic
- `refactor:` Code refactoring without behavioral changes
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Changes to build system or dependencies
- `ci:` Changes to GitHub Actions workflows or scripts
- `chore:` Maintenance tasks, license header updates

Example commit messages:
```
feat(agents): add nephrology specialist agent manifest
fix(guardrails): prevent false positive on qualified negation
docs(adr): document hexagonal memory ports decision
chore: update dependency packages
```

### 3. Spectrayan License Headers

Every source file (`.py`, `.ts`, `.tsx`, `.js`, `.mjs`, `.css`) must include the official Spectrayan Apache-2.0 copyright header:

```
Carefold — Healthcare AI Agent Marketplace & Runtime
Copyright 2026 Spectrayan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

To verify and auto-apply headers across the repository:
```bash
# Check for missing headers
pnpm run check:licenses

# Automatically apply missing headers
pnpm run fix:licenses
```

### 4. Pull Request Checklist

Before submitting your PR, verify all local quality gates:

```bash
# 1. License header check
pnpm run check:licenses

# 2. Backend test suite
backend/.venv/bin/pytest backend/tests/

# 3. Security penetration suite (47 attacks)
PYTHONPATH=backend/src backend/.venv/bin/python backend/tests/penetration_suite.py

# 4. Frontend TypeScript compiler check
pnpm --filter web typecheck

# 5. Frontend unit & component tests
pnpm --filter web test --exclude "**/chat.test.ts"

# 6. Frontend production build
pnpm --filter web build

# 7. Documentation build (strict mode)
mkdocs build --strict
```

---

## Authoring Specialist Agents & Skills

When proposing or contributing a new clinical or administrative agent:

1. **Agent Manifest (`agents/<agent-id>/agent.yaml`)**:
   - Must specify: `id`, `name`, `version`, `domain`, `category`, `risk_class`, `persona`, `skills`, and `system_prompt`.
   - `risk_class` must be one of: `admin`, `wellness`, `clinical_assist`, `education`.
2. **Clinical Safety Bounds**:
   - Every clinical agent must declare the `clinical-safety-boundaries` skill.
   - Emergency-sensitive agents must declare `emergency-red-flags`.
   - Manifest prompts must explicitly disclaim medical diagnosis and prescribing capabilities.
3. **Reference Guidelines**:
   - Clinical skills must link to verified clinical guidelines or published professional society standards in their `references/` directory.
   - Skills must include a concise 3-line Intended Use statement.

---

## Questions & Discussions

- **GitHub Issues**: For bug reports, feature requests, and clinical agent proposals.
- **Security Inquiries**: For security vulnerabilities or safety incidents, email `security@spectrayan.com`.
