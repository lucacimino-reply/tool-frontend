# Delivery review: frontend-booking-draft

## Candidate

- Delivery unit: `frontend-booking-draft` — Editable booking draft workflow.
- Repository: `https://github.com/lucacimino-reply/tool-frontend.git`.
- Base commit: `ff79f081e814b9fa5a5b4213f6799fca20b1bbae`.
- Candidate commit reviewed: `f7a09c0e05fb1197b04cdda96923b7652f733f14`.
- Agent Content: `agent-content-v14` at `58f6df9e56ae1ddf4c27c2b098ebe5a8985e4d2b`.

## Authoritative evidence

- `context/prd.md`: REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, and REQ-014.
- `context/design-description.md` and the scoped step 1-4 renders: retained summary strip, Clean visual language, service controls, calendar, mutually exclusive timing, and details controls.
- `context/openapi-spec.json`: authenticated `quoteBooking` (`POST /booking-quotes`) and its `BookingQuoteRequest`, `BookingQuote`, `ValidationProblem`, fixed-arrival enum, and USD money contracts.
- Task specifications: `booking-draft-service-summary`, `booking-draft-date-and-arrival`, and `booking-details-and-live-quote`.

## Review and corrections

- Confirmed `App.tsx` mounts steps 1-4 in production and owns a client-side retained draft, summary destinations, explicit discard, and stale quote-response protection.
- Confirmed quote requests use only service, arrival, frequency, extras, and an optional trimmed promo code; cookies are included and successful `billing.appointmentValue` is the only displayed appointment-value authority.
- Corrected compact-calendar week navigation so month and year boundaries always produce valid customer-local calendar dates.
- Corrected mobile summary styling to retain all required summary fields and appointment value through horizontal scrolling rather than hiding date, address, and total.
- Added browser input limits for the 255 and 2,000 character contract maxima and limited quote requests to quote-affecting draft selections, avoiding requests during arbitrary detail text entry.
- Added inline actionable feedback for quote `details.extras` validation errors.
- Updated the README image command to the manifest's current image tag.

## Verification

- `npm test -- --reporter=verbose`: passed, 3 files and 26 tests. This covers draft initialization/discard and retention, summary destinations, local-date rules and boundary normalization, exact mutually exclusive arrivals, details defaults/validation, quote request shape/cookies, canonical USD display, stale quote suppression, and quote field failures.
- `npm run build`: passed (`tsc -b && vite build`).
- `git diff --check`: passed.
- `docker build -t clean-frontend:booking-details-and-live-quote .`: passed without starting a container. The final image is built only from this repository and `build-manifest.json` records `clean-frontend:booking-details-and-live-quote`.
- Visual review: compared the implemented shared summary, service selection, monthly and compact date controls, timing selection, and details layout/styles against the four scoped renders; required headings, controls, blue selected/active emphasis, white/navy/muted-gray palette, and responsive summary behavior are present. The render's conflicting timing/details example selections were correctly superseded by the PRD defaults.
