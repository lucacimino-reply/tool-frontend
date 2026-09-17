# Browser verification

From the backend repository after `docker compose up -d`, run:

```text
playwright-cli -s=clean-e2e delete-data
playwright-cli -s=clean-e2e open --browser=firefox http://localhost:8080/
playwright-cli -s=clean-e2e run-code --filename=tests/playwright/browser-workflows.mjs
playwright-cli -s=clean-e2e close
```

The workflow uses independently authenticated browser contexts and saves the
current desktop visual evidence in `screenshots/`.
