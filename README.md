# NextStep AI Decision Assistant

## 1. Overview

This project is an AI application prototype for the NextStep AI
Application Developer challenge.

The agent follows:

**Understand → Reason → Ask → Recommend → Confirm → Execute → Reassess**

The central design principle is:

> **Recommendation is not execution.**

The agent can recommend an action, but externally visible or
irreversible actions require confirmation before execution.

------------------------------------------------------------------------

## 2. Architecture

``` text
User
  ↓
NextStep Mock API
  ↓
Understand
  ↓
Reason / Prioritise
  ↓
Ask ───────────────┐
  ↓                │
Recommend          │
  ↓                │
Confirmation Gate  │
  ↓                │
Execute Tool       │
  ↓                │
Reassess ──────────┘
  ↓
Trace
```

------------------------------------------------------------------------

## 3. Project Structure

``` text
server/
├── agent/
│   ├── agentloop.js
│   ├── decisionEngine.js
│   ├── actionManager.js
│   └── trace.js
├── api/
│   └── NextStepapi.js
├── routes/
│   └── agent.js
├── tools/
│   ├── actionPolicy.js
│   └── mockTools.js
├── server.js
├── testagent.js
├── testAnswer.js
├── testAction.js
├── testScenarios.js
├── testAllScenarios.js
├── finalSmokeTest.js
├── package.json
└── README.md
```

------------------------------------------------------------------------

## 4. Components

### NextStep API Integration

`api/NextStepapi.js`

Handles situation analysis, clarification answers, scenario retrieval,
candidate identification, idempotency keys, response parsing, and retry
handling.

### Agent Loop

`agent/agentloop.js`

Coordinates understanding, reasoning, clarification, recommendation,
confirmation requirements, and trace generation.

### Decision Engine

`agent/decisionEngine.js`

Converts API analysis into states such as:

-   `ASK`
-   `SUPPORT`
-   `OUT_OF_SCOPE`
-   `RECOMMEND`
-   `CONFIRM`

### Action Manager

`agent/actionManager.js`

Maintains pending and executed actions and prevents duplicate execution.

### Trace

`agent/trace.js`

Records step number, stage, message, timestamp, and related data.

### Mock Tools

`tools/mockTools.js`

Provides stubbed:

-   `draftMessage`
-   `createTask`
-   `updateSituation`
-   `calculateTime`

These are intentionally mocked because no real external accounts are
connected.

------------------------------------------------------------------------

## 5. Confirmation Policy

Actions with external side effects require confirmation.

Examples:

-   send a message
-   send an email
-   submit something
-   delete something
-   cancel something
-   contact another person

Planning/reversible examples:

-   draft a message
-   review information
-   plan
-   check information

Flow:

``` text
Recommendation
     ↓
Classify action
     ↓
External / irreversible?
     ↓
Yes → show action → user confirms → execute
```

------------------------------------------------------------------------

## 6. Action Lifecycle

``` text
PENDING
   │
   ├── CANCELLED
   │
   └── CONFIRMED
          ↓
       EXECUTED
```

Executed actions are retained separately so a repeated confirmation does
not execute the same action twice.

------------------------------------------------------------------------

## 7. Trace

Each run records stages such as:

``` text
reasoning
asking
proposing
confirmed
executed
```

Example:

``` text
1. [reasoning] Analysing the user's situation.
2. [reasoning] Identifying priorities and risks.
3. [asking] More information is required.
4. [proposing] Proposed next action.
5. [confirmed] User confirmation required.
6. [executed] Action executed.
```

This makes the agent's decision process auditable.

------------------------------------------------------------------------

## 8. Reliability

The provided API is intentionally unreliable. The integration therefore:

-   checks HTTP status
-   reads responses before parsing JSON
-   detects malformed JSON
-   retries temporary analysis failures
-   reuses the same idempotency key for retries of the same logical
    action

This prevents a retry from being treated as a new user action.

------------------------------------------------------------------------

## 9. Duplicate Execution Protection

A practical failure mode is a user or network sending the same
confirmation twice.

Expected behavior:

``` text
First confirmation  → executed
Second confirmation → already_executed
```

The second request must not perform the external action again.

------------------------------------------------------------------------

## 10. Reassessment

The prototype exposes:

`POST /api/agent/reassess`

Conceptually:

``` text
Initial situation
      ↓
Recommendation
      ↓
Action
      ↓
New information
      ↓
Reassess
      ↓
Re-evaluate priorities
```

The current reassessment endpoint is a lightweight stub rather than a
full external state-management integration.

------------------------------------------------------------------------

## 11. Scenario Testing

The challenge provides seven scenarios. The project retrieves them from
the API and can run them through the agent.

Run:

``` bash
node testAllScenarios.js
```

The scenario pack covers the documented categories including:

-   multi-problem
-   Hinglish
-   contradictory priorities
-   emotional/support
-   irrelevant or misuse
-   adversarial/prompt injection
-   worse-after-action

Known scenario IDs observed during testing include:

-   `s1_multi`
-   `s2_hinglish`
-   `s6_injection`
-   `s7_worse`

The remaining IDs are retrieved dynamically from the API.

------------------------------------------------------------------------

## 12. Prompt Injection

Situation text is not treated as authorization to bypass the agent's
control flow.

Prompt-injection instructions cannot by themselves bypass the
confirmation layer for external actions.

------------------------------------------------------------------------

## 13. Harmful / Misuse Requests

Depending on the API classification, the agent can:

-   ask for clarification
-   provide support-oriented handling
-   classify a request as out of scope
-   avoid automatically executing an external action

The prototype does not claim to replace a dedicated safety system.

------------------------------------------------------------------------

## 14. Recovery

Pending and executed actions are stored separately.

This allows the system to distinguish:

``` text
proposed → pending → executed
```

from:

``` text
proposed → pending → execution failure → recoverable
```

Real third-party transaction recovery is outside the scope because the
execution tools are mocked.

------------------------------------------------------------------------

## 15. Jugaad / Additional Problem

### Duplicate execution

A user can accidentally confirm the same action more than once because
of double-clicks, browser retries, or network retries.

The action manager therefore keeps executed actions and detects repeated
execution attempts.

Result:

``` text
First request   → execute
Repeated request → already executed
```

------------------------------------------------------------------------

## 16. Curveball Response

The architecture treats new information as a reason to reassess rather
than blindly continue with an old recommendation.

``` text
Old recommendation
       ↓
New information
       ↓
Reassess
       ↓
New priorities
       ↓
New recommendation
```

The prototype demonstrates this through the reassessment endpoint while
keeping full external state integration stubbed.

------------------------------------------------------------------------

## 17. What Is Implemented vs Stubbed

  Capability                      Status
  ------------------------------- -----------------
  Situation understanding         Implemented
  Priority/reasoning extraction   Implemented
  Clarification questions         Implemented
  Recommendation                  Implemented
  Confirmation gate               Implemented
  Action state                    Implemented
  Duplicate protection            Implemented
  Trace                           Implemented
  Scenario retrieval              Implemented
  Seven-scenario runner           Implemented
  Prompt-injection boundary       Implemented
  Reassessment endpoint           Stubbed
  Real message sending            Stubbed
  Real task creation              Stubbed
  Calendar integration            Not implemented
  External account integrations   Not implemented

------------------------------------------------------------------------

## 18. Testing

Install dependencies:

``` bash
npm install
```

Start:

``` bash
node server.js
```

Test situation analysis:

``` bash
node testagent.js
```

Test clarification flow:

``` bash
node testAnswer.js
```

Test confirmation/execution:

``` bash
node testAction.js
```

Retrieve scenarios:

``` bash
node testScenarios.js
```

Run all seven scenarios:

``` bash
node testAllScenarios.js
```

Final smoke test:

``` bash
node finalSmokeTest.js
```

Expected final smoke-test result:

``` text
ANALYSE    → 200
PROPOSE    → 200
CONFIRM    → 200
DUPLICATE  → 200
REASSESS   → 200
```

------------------------------------------------------------------------

## 19. AI Usage Disclosure

AI tools were used as a coding and reasoning assistant for:

-   understanding challenge requirements
-   architecture design
-   JavaScript generation and explanation
-   API debugging
-   confirmation-flow design
-   action-state design
-   documentation

Generated suggestions were reviewed and adapted to the actual project.

One example where an AI-generated approach was not immediately
sufficient was the clarification-answer API flow. The issue was isolated
so it did not block the stable analysis, decision, confirmation,
execution, and reassessment paths.

------------------------------------------------------------------------


## 20. Final Smoke Test

The completed prototype passed the final end-to-end smoke test:

``` text
1. ANALYSE:  200 | ASK | needs_clarification
2. PROPOSE:  200 | pending_confirmation
3. CONFIRM:  200 | executed
4. DUPLICATE: 200 | already_executed
5. REASSESS: 200 | reassessed
```

This demonstrates the core flow from situation analysis through
confirmation, execution, duplicate protection, and reassessment.

------------------------------------------------------------------------

## 21. Key Design Decision

The central design decision is:

``` text
Reasoning
    ↓
Recommendation
    ↓
Confirmation
    ↓
Execution
```


