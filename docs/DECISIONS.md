# Architecture Decision Log

## ADR-001 · Core product
Visual SDD, not a Lovable or Make clone. It visualizes, edits and controls the actual SDD process.

## ADR-002 · Two audiences, one engine
Nontechnical creators and Product Owners/small teams. Simple and Professional views reflect the same project state.

## ADR-003 · Idea-first entry
The first screen accepts an idea, even though in Sprint 00 the result is **only a local draft**. Automated SDD generation is a later sprint.

## ADR-004 · Adapter-first
Initial SDD integration will target Spec Kit; adapters will isolate that dependency.

## ADR-005 · Honest evidence
Agent claims, tests, approval and deployment are distinct states. No success label without evidence.

## ADR-006 · Owner-approved micro-sprints
Every sprint must be pushed, tested, documented (DOCX), deployed and explicitly approved before the next one begins.

## ADR-007 · Security
No untrusted code execution in the control-plane service. Agents require isolation and least privilege.
