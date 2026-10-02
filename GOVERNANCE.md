# Carefold Project Governance

Carefold is an open-source project governed through a meritocratic model designed to balance rapid innovation with stringent clinical safety, data privacy, and architectural integrity.

---

## 1. Principles of Governance

1. **Meritocracy**: Influence and decision-making authority are earned through sustained, high-quality contributions to code, documentation, clinical safety reviews, and community support.
2. **Clinical Safety First**: Any architectural or agent behavioral change that risks patient safety, diagnostic boundary compliance, or emergency red-flag detection is subject to immediate rejection.
3. **Transparency**: Discussions, roadmap planning, and architectural decisions take place openly via GitHub Issues, Pull Requests, and Architecture Decision Records (ADRs).
4. **Local-First & Privacy by Design**: Governance prioritizes patient autonomy, zero mandatory telemetry, and local-first execution.

---

## 2. Roles and Responsibilities

### 2.1 Project Lead (Spectrayan)
- Sets the strategic product vision, architectural principles, and long-term roadmap.
- Possesses final tie-breaking authority on controversial architectural decisions.
- Oversees brand, intellectual property, and trademark stewardship.

### 2.2 Core Maintainers
- **Responsibilities**:
  - Review and merge pull requests across `backend/`, `apps/web/`, `packages/`, and infrastructure.
  - Maintain build pipelines, CI/CD matrix, dependencies, and test automation.
  - Cut official releases and manage hotfixes.
- **Criteria for Nomination**:
  - Demonstrated technical mastery of the codebase over at least 3 months.
  - Track record of constructive, safety-conscious code reviews and contributions.
  - Approval by a two-thirds (2/3) supermajority of active Core Maintainers.

### 2.3 Clinical AI Reviewers
- **Responsibilities**:
  - Review agent manifests, prompt additions, and skill definitions under `agents/` and `skills/`.
  - Validate non-clinical safety boundaries, refusal behaviors, and intended-use specifications.
  - Verify that clinical reference documents stem from authoritative, evidence-based guidelines.
- **Criteria for Nomination**:
  - Background in clinical informatics, medicine, nursing, pharmacy, or healthcare compliance.
  - Approval by the Project Lead and at least one Core Maintainer.

### 2.4 Contributors
- Community members who submit bug reports, documentation updates, features, or agent packs.
- Anyone can become a contributor by submitting pull requests adhering to our contribution standards.

---

## 3. Decision-Making Process

### 3.1 Consensus-Seeking & Lazy Consensus
Carefold operates on a consensus-seeking model:
- **Routine Changes**: Bug fixes, minor documentation updates, and non-breaking dependency updates can be merged under **lazy consensus** (a pull request left open for at least 48 hours with at least one Core Maintainer approval and no objections).
- **Substantive Changes**: New features, new specialist agents, or API changes require explicit approval from at least two Maintainers (one of whom must be a Clinical AI Reviewer if `agents/` or `skills/` are modified).

### 3.2 Architecture Decision Records (ADRs)
Any change that alters the core execution model, ports-and-adapters taxonomy, memory interfaces, or security boundaries requires an Architecture Decision Record in `docs/adr/`.
- Proposed ADRs remain open for community comment for a minimum of 7 days.
- Acceptance requires approval from the Project Lead and Core Maintainers.

### 3.3 Voting
If consensus cannot be reached through technical discussion:
- The Project Lead may call a formal vote.
- Each Core Maintainer holds one vote.
- A motion passes with a **two-thirds (2/3) majority** of participating Maintainers.
- The Project Lead holds veto power on matters concerning licensing, security, or clinical safety liability.

---

## 4. Developer Certificate of Origin (DCO)

To ensure intellectual property cleanliness and open-source provenance under the Apache-2.0 license, Carefold adopts the Developer Certificate of Origin (DCO v1.1).

### DCO Text
```
By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it; and

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

All pull request commits must include a `Signed-off-by:` line with your real name and email address:
```
Signed-off-by: Jane Doe <jane.doe@example.com>
```
Use `git commit -s` to automatically append this line.

---

## 5. Release Cadence

- **Patch Releases (`x.y.Z`)**: Bi-weekly or as needed for critical bug and security fixes.
- **Minor Releases (`x.Y.0`)**: Monthly or quarterly, introducing new agents, memory backends, or features.
- **Major Releases (`X.0.0`)**: Coordinated with architectural milestones and consensus approval.

All releases follow [Semantic Versioning 2.0.0](https://semver.org/) and maintain a documented `CHANGELOG.md`.

---

## 6. Code of Conduct Enforcement

The Core Maintainers are responsible for investigating and enforcing the [Code of Conduct](CODE_OF_CONDUCT.md). Reports can be submitted in confidence to `conduct@carefold.org` or `security@spectrayan.com`.
