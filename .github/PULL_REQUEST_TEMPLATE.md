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

- [ ] `cd frontend && npm ci`
- [ ] `cd frontend && npm run lint`
- [ ] `cd frontend && npm run test:ci -- --runInBand`
- [ ] `cd frontend && npm run build`
- [ ] `python -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt`
- [ ] `python -m ruff check backend tests`
- [ ] `python -m pytest`

Add any relevant notes about skipped checks or environment limits.

## CI Expectations

- [ ] PR to `main` should validate but not push images
- [ ] `push` to `main` should publish `sha-*` and `branch-*` tags
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
- `SECURITY_RISK_ACCEPTANCE.md`

## Risks

- Describe any residual risk, compatibility concern, or follow-up work needed.
