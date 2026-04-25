# CD and Swarm Contract

This document defines the **future CD handoff contract** for the Tier 4 Docker Swarm target architecture.

It intentionally stops short of implementing a real deployment job. The goal of Step 9 is to ensure that the current CI outputs can be consumed by a later CD pipeline without redesigning image selection, secret naming, or deployment inputs.

## Scope

This contract covers:

- immutable image selection from CI outputs
- GitHub secret naming for future CD
- the expected handoff from CI to Docker Swarm deployment logic

This contract does **not** yet include:

- a real Swarm stack manifest
- a deployment workflow/job
- SSH execution steps
- monitoring stack deployment

## Target Architecture

- Tier target: **Tier 4 - Docker Swarm**
- Intended cluster shape:
  - 1 Swarm manager
  - 2 Swarm workers
- Registry: Docker Hub
- Image repositories:
  - `nguyenhongphu1/noteweb-frontend`
  - `nguyenhongphu1/noteweb-backend`

## Primary Deployment Rule

Future CD must deploy only the immutable image references generated from the CI commit SHA.

Required pattern:

- `nguyenhongphu1/noteweb-frontend:sha-<shortsha>`
- `nguyenhongphu1/noteweb-backend:sha-<shortsha>`

Forbidden as primary deployment identifiers:

- `latest`
- floating branch tags such as `branch-main`

Allowed for human traceability only:

- `branch-<sanitized-branch>`

## CI Output Contract

On `push` to `main`, the CI workflow generates an artifact named `swarm-delivery-contract`.

On `pull_request` validation runs, this artifact is intentionally **not** produced, because PR runs do not push the immutable images to Docker Hub and therefore do not create a deployable CD handoff.

Contents:

- `release-manifest.json`
  - machine-readable deployment contract
  - records Git SHA, branch, workflow run metadata, and exact immutable image refs
- `swarm-deployment-inputs.env`
  - shell-friendly variables for a future deployment job

The CI workflow also generates per-service evidence artifacts:

- `image-evidence-frontend`
- `image-evidence-backend`

These remain useful for audit and report evidence, but the primary future CD handoff artifact on `main` push runs is `swarm-delivery-contract`.

## Expected Future CD Consumption Path

The later CD job should follow this sequence:

1. Read `release-manifest.json` or `swarm-deployment-inputs.env`.
2. Extract:
   - `FRONTEND_IMAGE_REF`
   - `BACKEND_IMAGE_REF`
   - `SWARM_DEPLOYMENT_IDENTIFIER`
3. Update deployment inputs for the Swarm stack using only those immutable refs.
4. Connect to the Swarm manager via SSH.
5. Run a controlled Swarm update strategy such as rolling update.
6. Record the deployed `sha-*` identifier in logs for rollback and demo traceability.

## Future GitHub Secret Contract

### Secrets Already Required by Current CI

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### Secrets Reserved for Future CD to Docker Swarm

- `SWARM_MANAGER_HOST`
  - public DNS name or IP of the Swarm manager
- `SWARM_MANAGER_USER`
  - SSH user used by the deployment workflow
- `SWARM_MANAGER_SSH_KEY`
  - private key used by GitHub Actions to connect to the manager
- `SWARM_MANAGER_KNOWN_HOSTS`
  - pinned host key entries to prevent insecure host verification bypass

### Optional Future CD Variables or Secrets

These may become repository variables or environment-specific secrets later, depending on how staging/production is implemented:

- `SWARM_MANAGER_PORT`
- `SWARM_STACK_NAME`
- `DEPLOY_ENVIRONMENT`
- `APP_DOMAIN`

## Security Position

The future CD workflow should not rely on mutable image tags for deployment selection.

Reasons:

- mutable tags weaken rollback clarity
- mutable tags make demo traceability worse
- mutable tags create ambiguity between what CI produced and what production consumed

The `sha-*` contract keeps CI evidence, registry state, and deployment state aligned.

## Report Guidance

In the technical report, this contract should be cited in:

- **CI/CD Pipeline Design**
  - to explain the CI-to-CD handoff
- **Deployment & Orchestration**
  - to justify how Docker Swarm will consume immutable image refs
- **Lessons Learned**
  - to explain why CD was designed contract-first before live infrastructure rollout
