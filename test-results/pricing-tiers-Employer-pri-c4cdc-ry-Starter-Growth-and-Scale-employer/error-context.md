# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employer/pricing-tiers.spec.ts >> Employer pricing — 4 tiers >> pricing page lists Discovery, Starter, Growth, and Scale
- Location: e2e/employer/pricing-tiers.spec.ts:13:7

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://127.0.0.1:3100/employer/pricing
Call log:
  - navigating to "http://127.0.0.1:3100/employer/pricing", waiting until "load"

```

```
Error: write EPIPE
```

```
Error: browserContext.close: Target page, context or browser has been closed
```