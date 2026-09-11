# Delivery review: frontend-contact-form-submission

## Candidate

- Delivery unit: `frontend-contact-form-submission` / Build the STUDIO contact form
- Repository: `https://github.com/lucacimino-reply/tool-frontend.git`
- Base commit: `56eac2acf706579368f01f1a1ae161f2208f33d7`
- Candidate head reviewed: `24d63b67fed0038851934873f166fd0759281e59`
- Agent Content: `agent-content-v11` (`797f434fb8f5a4e3ca7cce4b4b9a63ff9508701b`)

## Scope and evidence

Reviewed the complete frontend vertical slice for `build-studio-contact-form`.
The authoritative evidence was `context/prd.md` (REQ-001, REQ-002, REQ-003,
REQ-004, REQ-005, REQ-006, and REQ-008),
`context/tasks/build-studio-contact-form.md`,
`context/openapi-spec.json` (`createContactSubmission`), and the permitted
`render-form-page-3-5` design render plus `context/design-description.md`.
`context/analysis/tool-frontend-711fa136.md` was used only as supporting
repository evidence. The binding React delivery reference was also reviewed.

The task owns the form view and its success transition boundary. Confirmation
rendering and Back to Home are explicitly owned by the subsequent Delivery
unit, so this review did not add that UI or any route.

## Defects corrected

- The browser default targeted `/api/contact-submissions`, while the OpenAPI
  operation and Task require configured-base `/contact-submissions`. The
  client now defaults to the same-origin `/contact-submissions` endpoint, and
  the Nginx runtime proxy exposes that same path without rewriting it.
- The empty-form layout diverged from the permitted Figma render: the mark,
  navigation gap, card padding/vertical placement, and action height were
  oversized or misplaced. CSS now uses the evidenced 16px mark, 24px nav gap,
  480px card with 48px padding, 52px action, and desktop card placement.
- The focused validation test did not prove the permitted 100-character name
  boundary. It now does.

## Contract and boundary review

- Validated raw inputs enforce the name 1-100 code-unit range and email
  254-code-unit maximum before fetch. The documented conventional email
  predicate is `^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$`; values are not trimmed or
  normalized.
- Invalid inputs render field-specific below-field errors and never invoke the
  API client. The request body contains exactly `name` and `email` as JSON.
- Only HTTP 201 reaches the success callback. All other statuses, rejected
  fetches, and client errors retain values and show exactly `Unable to submit
  your information. Please try again.` Pending submission disables the action
  and exposes loading text, preventing repeated requests.
- The public form boundary constrains both contract fields before protected
  application behavior (the network request). The client does not consume
  backend error text or perform unbounded submission requests.

## Verification

- `npm test` passed: 1 test file, 13 tests. It covers rendered form hierarchy,
  required/range/format validation, raw-value boundaries, no request on local
  failure, exact request construction, pending disablement, 201-only success,
  non-201 statuses, fetch rejection, and retained-value generic failures.
- `npm run build` passed: strict TypeScript project build and Vite production
  bundle completed.
- `docker build -t studio-contact-frontend:build-studio-contact-form .`
  passed without starting a container. The built image matches
  `build-manifest.json`.
- Source and rendered-design comparison confirmed the allowed form view's
  visible header, card, copy, ordered controls, presentational navigation, and
  arrow-bearing primary action. No routes, confirmation view, backend code,
  compose configuration, or unsupported backend/CORS assumptions were added.
