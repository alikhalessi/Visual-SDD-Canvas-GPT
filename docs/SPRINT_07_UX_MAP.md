# Sprint 07 — UX Journey Map
Scope: v0.7.0. This is a source-based design map, not a user-tested funnel.

## Human-controlled SDD journey

~~~mermaid
flowchart LR
  Guest["Open Overview"] --> Idea["Describe & save idea in browser"]
  Idea --> Spec["Write Specification"]
  Spec --> Approval{"Human approval of current revision?"}
  Approval -- "Needs correction" --> Spec
  Approval -- "Approved" --> Plan["Create & review Technical Plan"]
  Plan --> PlanGate{"Human approval of Plan?"}
  PlanGate -- "No" --> Plan
  PlanGate -- "Yes" --> Tasks["Define Tasks linked to criteria"]
  Tasks --> TaskGate{"Tasks reviewed & approved?"}
  TaskGate -- "No" --> Tasks
  TaskGate -- "Yes" --> GitHub["Optional GitHub handoff / traceability"]
  GitHub --> Evidence["Read-only PR/commit/check evidence"]
  Evidence --> Human["Human decides whether intent is satisfied"]
  Spec -. "Explicit cloud Save" .-> Cloud["Google / My Projects: Idea + Specification only"]
  Tasks -. "Browser-only until later sprint" .-> Backup["Export backup"]
~~~

## Discovery and recovery paths

~~~mermaid
flowchart TD
  Start["Overview · plain language default"] --> Brief["State-aware project command center"]
  Brief --> Next{"What is missing?"}
  Next -- "Idea" --> Idea["Write idea"]
  Next -- "Specification" --> Spec["Guided editor"]
  Next -- "Approval" --> Review["Validation + human approval"]
  Next -- "Approved specification" --> Canvas["SDD Canvas: Plan / Tasks"]
  Brief --> Professional["Professional mode · expanded seven-stage preview"]
  Brief --> MyProjects["My Projects · deliberate cloud save or load"]
  Start --> Cache{"Unreadable local Specification?"}
  Cache -- "Yes" --> Download["Download original recovery copy"]
  Download --> Choice{"User confirms cache clear?"}
  Choice -- "No" --> Preserve["Original cached text remains"]
  Choice -- "Yes" --> Clear["Clear only unreadable Specification key"]
~~~

## Usability objectives
- One clear next meaningful action on every early-stage project.
- No green state without real document, approval and evidence.
- Explain locally saved vs cloud-linked vs external GitHub clearly.
- Provide plain language without hiding governance or permissions.
- Keep keyboard and mobile interactions usable.
- Preserve unreadable browser data until explicit user intervention.

## Trust boundaries
Browser-only: Plan, Tasks, GitHub task associations and local drafts. Private Google cloud: explicitly saved Idea + Specification only. Public GitHub: optional Issue handoffs and PR/check facts. Codex execution is not proven by passing validation or CI.

## Persona scenarios
**New founder:** open Overview → capture idea → guided Specification → human approval → planning Canvas.

**Professional Product Owner:** expand detailed workflow → inspect revisions and acceptance criteria → check change impact and public PR metadata → decide next controlled action.

## Current validation limit
No independent screenshot, smartphone or screen-reader usability study was completed in this chat. UX improvements were source-audited; browser acceptance remains a separate release gate.
