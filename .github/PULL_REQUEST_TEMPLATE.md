## Summary

- Describe the technical purpose of this PR.
- State whether the change affects CI only, CI-to-CD contract, or runtime behavior.

## Scope

- [ ] Frontend CI
- [ ] Backend CI
- [ ] Security scanning
- [ ] Image publishing contract
- [ ] Future Docker Swarm CD contract
- [ ] Documentation or handoff only

## Verification

- [ ] `cd apps/frontend && npm ci`
- [ ] `cd apps/frontend && npm run lint`
- [ ] `cd apps/frontend && npm run test:ci -- --runInBand`
- [ ] `cd apps/frontend && npm run build`
- [ ] `python -m pip install -r apps/backend/requirements.txt -r apps/backend/requirements-dev.txt`
- [ ] `python -m ruff check apps/backend tests`
- [ ] `python -m pytest`
- [ ] `python -m build --wheel --outdir artifacts/backend-dist`

Add any relevant notes about skipped checks or environment limits.

## CI Expectations

- [ ] PR to `main` should validate but not push images
- [ ] branch pushes outside `main` should validate but not push images
- [ ] `push` to `main` should publish `sha-*` and `branch-*` tags
- [ ] `push` of a `v*` Git tag should publish `sha-*` and the matching release tag
- [ ] Security gates for `HIGH` and `CRITICAL` findings remain enforced
- [ ] `sha-*` remains the primary deployment identifier

## Evidence and Docs

- [ ] README updated if workflow behavior or contracts changed
- [ ] Evidence docs updated if artifacts or report mapping changed
- [ ] Security risk acceptance docs updated if any exception policy changed

Relevant files:

- `README.md`
- `docs/CI_EVIDENCE_MAP.md`
- `docs/CD_SWARM_CONTRACT.md`
- `docs/security/SECURITY_RISK_ACCEPTANCE.md`

## Risks

- Describe any residual risk, compatibility concern, or follow-up work needed.
