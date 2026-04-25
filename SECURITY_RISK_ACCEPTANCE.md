# Security Risk Acceptance

This repository keeps Trivy severity gates enabled for both source scanning and image scanning.

## Current exception scope

The current exception file is [`.trivyignore.yaml`](.trivyignore.yaml).

It is intentionally scoped only to:

- `frontend/package-lock.json`

The accepted findings currently come from the legacy `react-scripts` / CRA build toolchain used to build the frontend in CI. These packages exist in the source dependency graph and in the builder stage, but they are not shipped in the final frontend runtime image, which is the Nginx stage from [`frontend/dockerfile`](frontend/dockerfile).

## Why this is acceptable for now

- The project still enforces Trivy image scans with `HIGH,CRITICAL` blocking behavior.
- The final frontend runtime image contains built static assets served by Nginx rather than the CRA toolchain itself.
- The ignore rules are path-scoped to `frontend/package-lock.json` instead of globally muting the same CVE IDs everywhere else.
- Every accepted finding has an expiration date so the exception cannot remain silent indefinitely.

## Non-accepted areas

The following remain blocking with no exception file:

- backend runtime image vulnerabilities
- frontend runtime image vulnerabilities
- source-repo secrets
- misconfiguration findings outside explicit Trivy suppression

## Exit plan

This exception should be removed by one of these approaches:

1. Migrate away from `react-scripts` / CRA to a maintained frontend build stack.
2. Regenerate the frontend dependency graph with safe transitive versions once the toolchain path is updated.
3. Remove each Trivy suppression entry as upstream packages become practically upgradable without destabilizing the build.
