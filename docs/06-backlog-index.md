# Backlog index

Import these IDs as-is.

## Capabilities

| ID | Title | Phase |
|---|---|---|
| CF-C1 | Local-first runtime | 0 |
| CF-C2 | Skill packs | 0 |
| CF-C3 | Safe public catalog | 0 |
| CF-C4 | Operator visibility | 0 |
| CF-C5 | Contributor kit | 0 |
| CF-C6 | Package and self-host | 0 |
| CF-C11 | Named agents (skills + tools) | 0 |
| CF-C12 | Local agent marketplace + Try in chat | 0 |
| CF-C7 | Pack install from git | 1 |
| CF-C8 | Optional local memory (Spector) | 1 |
| CF-C9 | Clinic adapter (private) | 2 |
| CF-C10 | Carefold Cloud (proprietary) | 3 |

## Epics

| ID | Title | Capability | Phase |
|---|---|---|---|
| CF-E1 | App shell and chat | CF-C1 | 0 |
| CF-E2 | Node CLI | CF-C1, CF-C5 | 0 |
| CF-E3 | Skill runner | CF-C2, CF-C3 | 0 |
| CF-E4 | Reference skills | CF-C3 | 0 |
| CF-E5 | Evals and CI | CF-C3, CF-C5 | 0 |
| CF-E6 | Audit and config | CF-C4 | 0 |
| CF-E7 | Docs and governance | CF-C5 | 0 |
| CF-E8 | Docker | CF-C6 | 0 |
| CF-E9 | Helm | CF-C6 | 0 |
| CF-E10 | Terraform | CF-C6 | 0 |
| CF-E15 | Agents compose skills and tools | CF-C11 | 0 |
| CF-E16 | Local marketplace and Try in chat | CF-C12 | 0 |
| CF-E11 | Remote pack install | CF-C7 | 1 |
| CF-E12 | Optional Spector MCP | CF-C8 | 1 |
| CF-E13 | Spectrayan Health adapter | CF-C9 | 2 |
| CF-E14 | Carefold Cloud | CF-C10 | 3 |

## Stories

| ID | Title | Epic | Phase | Pri |
|---|---|---|---|---|
| CF-S01 | Open the local app | CF-E1 | 0 | P0 |
| CF-S02 | Stream a reply | CF-E1 | 0 | P0 |
| CF-S03 | Show tool trace | CF-E1 | 0 | P0 |
| CF-S04 | Attach a local file | CF-E1 | 0 | P0 |
| CF-S05 | Disclaimer and intended use | CF-E1 | 0 | P0 |
| CF-S06 | carefold init | CF-E2 | 0 | P0 |
| CF-S07 | carefold skill add (bundled) | CF-E2 | 0 | P0 |
| CF-S08 | carefold skill list | CF-E2 | 0 | P0 |
| CF-S09 | carefold run | CF-E2 | 0 | P0 |
| CF-S10 | carefold log | CF-E2 | 0 | P1 |
| CF-S11 | Load Agent Skills + carefold.yaml | CF-E3 | 0 | P0 |
| CF-S12 | Tool allow-list | CF-E3 | 0 | P0 |
| CF-S13 | Forbidden intents | CF-E3 | 0 | P0 |
| CF-S14 | Risk class gate | CF-E3 | 0 | P0 |
| CF-S15 | OpenAI-compatible model adapter | CF-E3 | 0 | P0 |
| CF-S16 | Skill visit-prep | CF-E4 | 0 | P0 |
| CF-S17 | Skill benefits-explainer | CF-E4 | 0 | P0 |
| CF-S18 | Skill habit-checkin | CF-E4 | 0 | P0 |
| CF-S19 | Skill template | CF-E4 | 0 | P0 |
| CF-S20 | Golden eval runner | CF-E5 | 0 | P0 |
| CF-S21 | Safety eval pack | CF-E5 | 0 | P0 |
| CF-S22 | Offline CI | CF-E5 | 0 | P0 |
| CF-S23 | JSONL audit log | CF-E6 | 0 | P0 |
| CF-S24 | Audit viewer | CF-E6 | 0 | P1 |
| CF-S25 | Workspace config | CF-E6 | 0 | P0 |
| CF-S26 | README intended use | CF-E7 | 0 | P0 |
| CF-S27 | ACCEPTABLE_USE | CF-E7 | 0 | P0 |
| CF-S28 | SECURITY | CF-E7 | 0 | P0 |
| CF-S29 | CONTRIBUTING | CF-E7 | 0 | P0 |
| CF-S30 | License and NOTICE | CF-E7 | 0 | P0 |
| CF-S31 | Production image | CF-E8 | 0 | P0 |
| CF-S32 | docker compose | CF-E8 | 0 | P0 |
| CF-S33 | Image digest note | CF-E8 | 0 | P2 |
| CF-S34 | Helm chart | CF-E9 | 0 | P1 |
| CF-S35 | Chart values documentation | CF-E9 | 0 | P1 |
| CF-S36 | Terraform Helm module | CF-E10 | 0 | P1 |
| CF-S37 | Terraform kind example | CF-E10 | 0 | P2 |
| CF-S43 | Load agent.yaml | CF-E15 | 0 | P0 |
| CF-S44 | Chat scoped to an agent | CF-E15 | 0 | P0 |
| CF-S45 | Bundled agents | CF-E15 | 0 | P0 |
| CF-S46 | Agent cannot activate undeclared skills | CF-E15 | 0 | P0 |
| CF-S47 | Agent CLI | CF-E15 | 0 | P0 |
| CF-S48 | Marketplace home | CF-E16 | 0 | P0 |
| CF-S49 | Agent detail | CF-E16 | 0 | P0 |
| CF-S50 | Try in chat | CF-E16 | 0 | P0 |
| CF-S51 | Switch agent from chat | CF-E16 | 0 | P1 |
| CF-S52 | Marketplace empty / add | CF-E16 | 0 | P1 |
| CF-S38 | Install from git URL | CF-E11 | 1 | P0 |
| CF-S39 | Remote catalog entries | CF-E11 | 1 | P1 |
| CF-S40 | Attach Spector if present | CF-E12 | 1 | P2 |
| CF-S41 | Load packs in clinic app | CF-E13 | 2 | P0 |
| CF-S42 | Signed pack index | CF-E14 | 3 | P0 |

## Phase 0 launch slice (P0 only)

Build this set before the first public tag:

CF-S01–S09, S11–S23, S25–S32, S43–S50.

Marketplace + Try in chat are P0. Helm (S34–S35) and Terraform (S36) can
trail a week if compose already works. Do not start S38–S42 before the
launch bar in [01-product-scope.md](./01-product-scope.md) is green.
