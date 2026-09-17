# Delivery Review: frontend-public-home

## Candidate

- Delivery: `frontend-public-home` (Public Clean home experience)
- Task: `build-public-clean-home`
- Base commit: `56eac2acf706579368f01f1a1ae161f2208f33d7`
- Candidate commit: `a79ab137e3608e3787e9622473ac3488305d0563`
- Agent Content: `agent-content-v14` at `58f6df9e56ae1ddf4c27c2b098ebe5a8985e4d2b`

## Reviewed Evidence

- `context/prd.md`: REQ-001 and REQ-014.
- `context/tasks/build-public-clean-home.md`: task completion, constraints, acceptance criteria, and verification requirements.
- `context/design-description.md` and `render-home-73-11`: the sole allowed design reference. The render's header, hero/form, Shield story, editorial section, decorative band, and footer were compared against the implementation.
- `context/openapi-spec.json`: this unit lists no OpenAPI operations and makes no HTTP calls. The production proxy preserves the reserved `/api/*` boundary for later units.
- `delivery-frontend` and `references/frontend-react.md`: React/Vite/TypeScript structure, production mount, packaging, and Nginx criteria.

## Results

- `App.tsx` mounts `HomePage` through `main.tsx`. The page keeps location, rooms, and clean type in one client-side state owner.
- Studio, 2 rooms, and Standard are preselected. Header categories change only location with blue selected treatment; rooms are limited to 1-9; clean types are limited to the four required choices with informational estimates.
- The page includes the mandated wordmark, Login and Booking entry controls, evidenced home hierarchy, named report cards, visual-only links, and responsive desktop/mobile layouts. No pricing, scheduling, authentication, backend calls, or unintended destinations were added.
- No OpenAPI operation applies to this unit. There is no browser-accessible unbounded request or payload boundary: controls are fixed enumerations and the candidate performs no network request. The startup configuration boundary now rejects malformed upstream URLs before Nginx processes traffic.

## Defects Corrected

- Strengthened `BACKEND_UPSTREAM` validation so a scheme-only or whitespace host is rejected instead of being accepted as a valid upstream URL.
- Expanded focused home tests to exercise every permitted room count, all clean-type estimates, and Booking's handoff of the current client-side selection.

## Verification

- `npm test`: passed, exercising home defaults, category isolation, all room counts, all clean types and estimates, Booking handoff, wordmark reset, and inert visual links.
- `npm run build`: passed, including strict TypeScript checking and Vite production build.
- The upstream-validator shell check accepted `https://api.example.test` and rejected a scheme-only URL, whitespace host, and query-only host.
- `docker build -t clean-frontend:build-public-clean-home .`: passed without starting a container. The build used only this repository and created the image recorded in `build-manifest.json`.
- `build-manifest.json` records `clean-frontend:build-public-clean-home`.
