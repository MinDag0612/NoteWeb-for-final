# Phase 2 Handoff

This document summarizes the current branch state for review, demo preparation, and later transition into real Docker Swarm CD work.

## Branch Status

- Branch: `feature/module2-ci`
- Phase focus: high-quality CI first, then CD/Swarm preparation
- Architecture target: **Tier 4 Docker Swarm**
- Current CI source of truth: GitHub Actions
- Container registry: Docker Hub

## Completed Scope

### Step 7

- repository security scanning is enforced
- container image scanning is enforced
- frontend CRA-related findings are handled through scoped risk acceptance
- backend image was materially hardened to pass Trivy policy

### Step 8

- CI now uploads explicit evidence artifacts
- frontend build artifact is preserved
- filesystem Trivy report is preserved
- image-level Trivy reports, SBOMs, and metadata are preserved
- evidence-to-rubric mapping is documented

### Step 9

- CI now emits a `swarm-delivery-contract` artifact on `push` to `main`
- future Docker Swarm CD secret contract is documented
- immutable `sha-*` image consumption is explicitly defined
- no live deploy job has been added yet

## Key Artifacts

Primary workflow:

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Evidence and contract docs:

- [`docs/CI_EVIDENCE_MAP.md`](CI_EVIDENCE_MAP.md)
- [`docs/CD_SWARM_CONTRACT.md`](CD_SWARM_CONTRACT.md)
- [`SECURITY_RISK_ACCEPTANCE.md`](../SECURITY_RISK_ACCEPTANCE.md)
- [`SECURITY_RISK_ACCEPTANCE.vi.md`](../SECURITY_RISK_ACCEPTANCE.vi.md)

Primary CI artifacts expected from GitHub Actions:

- `frontend-build`
- `trivy-fs-report`
- `image-evidence-frontend`
- `image-evidence-backend`
- `swarm-delivery-contract` on `push` to `main`

## What Is Intentionally Not Done Yet

- no real cloud infrastructure provisioning
- no public domain or HTTPS deployment
- no Docker Swarm cluster bootstrap or stack manifest
- no automated CD job over SSH
- no Prometheus/Grafana deployment

These are expected to be handled in later phases, not retrofitted into Phase 2 documentation.

## Review Checklist

Before creating or updating a PR:

1. Confirm the branch is clean.
2. Re-run local CI validation where feasible.
3. Verify README and docs still match the actual workflow behavior.
4. Confirm the immutable image tag contract remains `sha-*`.
5. Confirm no secrets or environment-specific credentials were committed.

## Demo Preparation Notes

When presenting the current state, describe it accurately:

- CI is implemented and high-confidence.
- CD is contract-ready, not production-live yet.
- Swarm is the target orchestration tier, not the current deployed reality.
- Evidence artifacts are available for report and demo support.

## Next Logical Work After Phase 2

1. Define the real Swarm stack manifest and service topology.
2. Provision the manager and worker nodes on a cloud provider.
3. Implement the CD workflow that consumes `swarm-delivery-contract`.
4. Add runtime monitoring with Prometheus and Grafana.
5. Prepare the end-to-end demo path required by Section V.
