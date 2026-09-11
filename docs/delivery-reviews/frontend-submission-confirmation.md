# Delivery review: frontend-submission-confirmation

## Candidate

- Delivery unit: `frontend-submission-confirmation` / Complete the confirmation and return flow
- Repository: `https://github.com/lucacimino-reply/tool-frontend.git`
- Base commit: `fde825ef6fc4cb11d31f56ae3b210cbcffd0fc87`
- Candidate head reviewed: `d7e9d027e61aec5cab3269c1b1612431b369ea23`
- Agent Content: `agent-content-v11` (`797f434fb8f5a4e3ca7cce4b4b9a63ff9508701b`)

## Scope and Evidence

Reviewed the complete frontend vertical slice for
`render-submission-confirmation`. Authoritative evidence was `context/prd.md`
(REQ-001, REQ-002, REQ-005, REQ-007, and REQ-008),
`context/tasks/render-submission-confirmation.md`,
`context/openapi-spec.json` (`createContactSubmission`),
`context/design-description.md`, and the allowed `render-form-page-3-5` and
`render-confirmation-page-3-32` renders. The frontend repository analysis was
supporting evidence only. The binding React delivery reference was reviewed.

The client exposes exactly the contact form and success confirmation as local
views. It posts the OpenAPI `name` and `email` JSON body to
`POST /contact-submissions`, transitions only on HTTP 201, and does not add
routes or functional header destinations.

## Defects Corrected

- The confirmation reused the form view's vertical placement and spacing. This
  did not match the confirmation render's lower, compact 480px bordered card.
  The shared frame now accepts a view-specific main class; the confirmation
  card uses the evidenced 218px desktop placement, 48px padding, 64px success
  mark, and measured 40px, 16px, and 20px internal spacing. Narrow screens
  retain the existing usable responsive placement.
- Focused confirmation coverage did not assert the success-card treatment or
  prove that earlier validation feedback was absent after returning. The
  success flow test now exercises prior validation, pending response, HTTP 201
  transition, card and mark composition, and cleared return state.

## Contract and Boundary Review

- `createContactSubmission` sends only the OpenAPI request properties with
  `Content-Type: application/json`; it treats only HTTP 201 as success. Every
  non-201 status and rejected or malformed fetch remains on the form and uses
  the specified generic failure message.
- Name and email limits are checked before `fetch`, so invalid or oversized
  contract inputs cannot reach protected submission behavior. Tests cover the
  required values, the 100-character name boundary, the 254-character email
  boundary, and email format rejection.
- Pending submission disables the sole submit action; there is no repeated
  request path. Back to Home remounts the controlled form with empty values and
  no stale validation, pending, or failure state.

## Verification

- `npm test` passed: 1 file, 17 tests. It covers local validation and request
  suppression, request construction, pending disablement, 201-only transition,
  rejected/non-201 failure behavior, confirmation content, inert header labels,
  and Back to Home reset.
- `npm run build` passed: strict TypeScript project build and Vite production
  bundle completed.
- `docker build -t studio-contact-frontend:render-submission-confirmation .`
  passed without starting a container. `build-manifest.json` identifies that
  exact image name and tag.
- Source and render comparison confirmed both permitted views' shared STUDIO
  frame, centered bordered cards, exact confirmation copy, pale-green checkmark
  treatment, outlined return control, and presentational-only navigation.
