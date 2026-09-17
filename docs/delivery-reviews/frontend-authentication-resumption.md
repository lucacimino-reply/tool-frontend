# Delivery Review: frontend-authentication-resumption

## Candidate

- Delivery: `frontend-authentication-resumption` (Authentication and booking resumption)
- Task: `clean-authentication-and-booking-resumption`
- Base commit: `406466653840a62d937b9c7425f3f47bdefbdffa`
- Candidate commit: `bc6093f09e3003e7ee130f2859cf24f3e97a6442`
- Agent Content: `agent-content-v14` at `58f6df9e56ae1ddf4c27c2b098ebe5a8985e4d2b`

## Reviewed Evidence

- `context/prd.md`: REQ-002, REQ-003, and REQ-014.
- `context/tasks/clean-authentication-and-booking-resumption.md`: task outcome, implementation constraints, acceptance criteria, and verification requirements.
- `context/openapi-spec.json`: `signUp`, `logIn`, and `getSession`, including cookie transport and 401, 409, and 422 responses.
- `context/design-description.md` and the allowed renders: `render-home-73-11`, `render-login-page-151-2`, `render-login-_incorrect-password-or-email-152-1019`, `render-signup-page-186-636`, and `render-booking-process-_step-1-99-355`.
- `delivery-frontend` and `references/frontend-react.md`: React/Vite/TypeScript, production composition, HTTP, error handling, and container criteria.

## Results

- `main.tsx` mounts `App`, which restores the cookie-backed session through `getSession`, keeps home selection separate from the pending booking handoff, and composes home, authentication, and step 1.
- Authentication requests use the required relative `/api/auth/*` paths with `credentials: 'include'`. Client validation trims names and email addresses, preserves password bytes, enforces the specified credential limits and consent, and maps contracted field failures.
- A login 401 keeps the visitor signed out and renders exactly `The email or password you entered is incorrect.` Signup and login both retain the temporary location, room, and clean-type handoff through account-switch navigation and consume it only on success.
- The rendered home, login, login-error, signup, and step-1 views account for their allowed design evidence: Clean wordmarks, centered low-distraction forms, blue actions and selected states, red invalid feedback, password controls, consent text, and the horizontal booking summary.
- Input limits are validated before `logIn` or `signUp` requests. The only consumer-facing request bodies in this unit are the bounded authentication schemas, so oversized credentials cannot reach protected authentication behavior.

## Defects Corrected

- Booking activated while `getSession` was still resolving could route an already authenticated browser to Login. The application now retains the selected handoff until session restoration resolves, then routes to step 1 for an authenticated session or Login for a signed-out session.
- Contracted server failures without field errors produced no feedback. Authentication now exposes a safe generic form error while preserving entered values.
- The README container command and API description now match this Candidate's image tag and authentication traffic.

## Verification

- `npm test`: passed, 16 tests. This covers cookie-backed session restoration, the startup booking race, payload normalization, preserved password whitespace, exact 401 text, client validation, duplicate-email and 422 field-error mapping, generic failures, password visibility, both pending-booking success paths, standalone success, and authentication exits.
- `npm run build`: passed, including strict TypeScript project checking and Vite production generation.
- `docker build -t clean-frontend:clean-authentication-and-booking-resumption .`: passed without starting a container. The image build used this repository only.
- `build-manifest.json` records `clean-frontend:clean-authentication-and-booking-resumption`.
