# Sprint 01A — UX Foundation / Scope and acceptance

The goal is to make Visual SDD understandable to nontechnical users without inventing implementation status or expanding into a general-purpose app builder.

## Deliverables

- A guided three-step onboarding journey: idea, specification, human approval, based on real local project state.
- A clear contextual next action; successful validation does not imply approval.
- Responsive mobile workspace navigation, with an always-available path to the editor.
- A skip-to-main link, semantically named navigation, better keyboard focus, and clearer status text.
- A copy and help pass around specification authoring and browser-only persistence.
- Simple / Professional mode preference remembered locally, without changing the specification.
- Regression tests for onboarding state and existing SDD domain behaviors.

## Acceptance criteria

1. A new user sees a meaningful action, not a dead-end dashboard.
2. A saved idea prompts specification creation.
3. A draft specification with unresolved items prompts editing; a validated draft prompts human review.
4. Approved specifications show planning as unavailable, not as an executed workflow.
5. The main views remain reachable on a narrow mobile viewport.
6. Users can skip navigation and reach the primary content using a keyboard.
7. The Simple/Professional preference survives reload in the same browser.
8. No cloud storage, Google OAuth, or real agent execution is implied in UI copy.
9. Unit tests, TypeScript check and production build pass; report and deployed URL are recorded.

## Explicit exclusions

Google Login, hosted accounts, cross-device persistence, genuine SDD workflow execution and code-generation agents. These are not part of Sprint 01A. They remain for later approved sprints.
