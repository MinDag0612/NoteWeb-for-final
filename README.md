# NoteWeb

NoteWeb is a full-stack web application for creating, editing, and managing personal notes with image upload support.

## 1. Project Overview

The project is implemented using a React frontend and a FastAPI backend.  
Authentication supports local login and Google login. Data is stored in MongoDB.

## 2. Architecture

```
Browser (React SPA)
        |
        | HTTP/HTTPS
        v
     Nginx (Phase 2+ deployment)
        |
        | /api/*
        v
 FastAPI (Gunicorn + Uvicorn worker)
        |
        v
 MongoDB Atlas
```

## 3. Technology Stack

- Frontend: React, React Router, Bootstrap
- Backend: FastAPI, Gunicorn, Uvicorn, Python 3
- Database: MongoDB Atlas
- CI/CD: GitHub Actions, Docker Hub, Trivy
- Target deployment architecture: Tier 4 Docker Swarm on Ubuntu-based cloud nodes

## 4. Repository Structure

```text
.
|- backend/          # FastAPI backend source
|- src/                 # React frontend source
|- public/              # Static frontend assets
|- scripts/             # Linux automation scripts (Phase 1/2)
|- deploy/              # Deployment assets (Nginx, systemd service, manual deploy notes)
|- docs/                # Evidence screenshots and project docs
|- .env.example         # Environment variable template
|- README.md
```

## 5. Local Development Setup

### 5.1 Prerequisites

- Node.js 20+
- npm 10+
- Python 3.10+ (or compatible)
- MongoDB Atlas connection string

### 5.2 Clone Repository

```bash
git clone https://github.com/MinDag0612/note-web-app-DOM.git
cd note-web-app-DOM
```

### 5.3 Configure Environment Variables

```bash
cp .env.example .env
```

Update `.env` with real values before running backend features that depend on third-party services.

### 5.4 Run Frontend

```bash
npm install
npm start
```

Frontend default URL: `http://localhost:3000`

### 5.5 Run Backend

```bash
python -m venv .venv
# Linux/macOS:
source .venv/bin/activate
# Windows PowerShell:
# .\.venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Backend health check: `http://127.0.0.1:8000/`

## 6. Environment Variables

All environment variables are documented in `.env.example`.

- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET_KEY`: secret key for JWT token signing
- `GG_CLIENT_ID`: Google OAuth client ID
- `CLOUDY_NAME`: Cloudinary cloud name
- `CLOUDY_API_KEY`: Cloudinary API key
- `CLOUDY_SECRET`: Cloudinary API secret
- `REACT_APP_API_*`: frontend API endpoint paths

No real credentials are committed to this repository.

## 7. Automation Scripts (`/scripts`)

- `scripts/setup.sh`: Phase 1 Ubuntu preparation script.
  - Installs required runtimes and OS packages.
  - Creates required directories (`logs`, `uploads`, `data`).
  - Prepares backend virtual environment and frontend dependencies.
  - Prints clear step-by-step logs.
- `scripts/deploy.sh`: deployment-oriented script used in later manual deployment steps.

## 8. Deployment Direction (Later Phases)

Earlier deployment notes in this repository may reference `Nginx + systemd` from a previous manual-deployment phase.

The current final-project target architecture is:

- Tier 4 Docker Swarm
- multi-node cluster
- immutable container deployment using `sha-*` image tags from CI

At the current Phase 2 / Step 9 boundary:

- CI is the implemented source of truth
- CD to Swarm is not yet live
- Swarm stack manifests and production rollout logic are intentionally deferred to the next step

Legacy notes remain useful as historical context, but they are not the final deployment architecture for the final project.

Current CI-to-CD preparation docs:

- [`docs/CI_EVIDENCE_MAP.md`](docs/CI_EVIDENCE_MAP.md)
- [`docs/CD_SWARM_CONTRACT.md`](docs/CD_SWARM_CONTRACT.md)

## 9. Git Workflow and Collaboration Policy

The intended workflow for this repository:

- All development is done on feature branches.
- `main` is updated only through Pull Requests.
- Every PR must include a clear description and at least one reviewer approval.
- Branch protection rules are enabled on `main` (no direct push, no force push).

## 10. CI Image Publishing Contract

Phase 2 currently uses GitHub Actions as the CI system of record. The workflow file is [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Docker Hub repositories used by CI:

- `nguyenhongphu1/noteweb-frontend`
- `nguyenhongphu1/noteweb-backend`

Image tagging strategy:

- Primary deployment tag: `sha-<shortsha>`
- Traceability tag: `branch-<sanitized-branch>`
- `latest` is intentionally not used as a deployment contract
- Release-style tags such as `vX.Y.Z` are reserved for a later release flow and are not published by the current workflow

Examples:

- `nguyenhongphu1/noteweb-frontend:sha-dee566c`
- `nguyenhongphu1/noteweb-frontend:branch-feature-module2-ci`
- `nguyenhongphu1/noteweb-backend:sha-dee566c`
- `nguyenhongphu1/noteweb-backend:branch-main`

## 11. Required GitHub Secrets

The current CI workflow requires these repository secrets for image publishing:

- `DOCKERHUB_USERNAME`: Docker Hub account name used for `docker login`
- `DOCKERHUB_TOKEN`: Docker Hub access token used by GitHub Actions

Notes:

- `DOCKERHUB_TOKEN` should be a scoped access token, not the Docker Hub account password.
- Pull request validation does not push images, so Docker Hub secrets are only required for `push` runs on `main`.

Reserved secret contract for future Docker Swarm CD:

- `SWARM_MANAGER_HOST`: public DNS name or IP of the Swarm manager
- `SWARM_MANAGER_USER`: SSH user used by the deployment workflow
- `SWARM_MANAGER_SSH_KEY`: private key used by GitHub Actions to access the manager
- `SWARM_MANAGER_KNOWN_HOSTS`: pinned host keys for safe SSH host verification

Optional future deployment variables:

- `SWARM_MANAGER_PORT`
- `SWARM_STACK_NAME`
- `DEPLOY_ENVIRONMENT`
- `APP_DOMAIN`

## 12. Expected CI Behavior

`pull_request` targeting `main`:

- runs frontend lint, test, and production build
- runs backend dependency install, `ruff`, and `pytest`
- runs Trivy filesystem scan on the repository
- builds and scans both container images locally in CI
- uploads the frontend build artifact and Trivy filesystem report
- does not log in to Docker Hub
- does not push any image tags

`push` to `main`:

- runs the same validation and security stages as PR
- builds and scans both container images
- logs in to Docker Hub using repository secrets
- pushes exactly two tags per image:
  - `sha-<shortsha>`
  - `branch-main`

Operational expectations:

- Any `HIGH` or `CRITICAL` findings from Trivy cause the security stage to fail.
- The immutable tag to be consumed by future CD or Docker Swarm deployment is `sha-*`.
- The `branch-*` tag exists for operator traceability and quick human lookup, not as the primary deployment identifier.

Security exception note:

- Source-repo Trivy enforcement uses a path-scoped exception file for legacy CRA build-time findings in `frontend/package-lock.json`. The rationale and exit plan are documented in [`SECURITY_RISK_ACCEPTANCE.md`](SECURITY_RISK_ACCEPTANCE.md).
- Container image Trivy enforcement remains blocking for fixable `HIGH` and `CRITICAL` findings, while ignoring unfixed upstream issues until vendor patches exist. The rationale is documented in [`SECURITY_RISK_ACCEPTANCE.md`](SECURITY_RISK_ACCEPTANCE.md).

## 13. CI Evidence Artifacts

Phase 2 CI now produces explicit evidence artifacts intended for grading, report writing, and demo support:

- `frontend-build`
  - reproducible frontend production build output
- `trivy-fs-report`
  - repository-level Trivy JSON report for vulnerabilities, secrets, and misconfigurations
- `image-evidence-frontend`
  - frontend image metadata JSON
  - frontend Trivy image JSON report
  - frontend CycloneDX SBOM
- `image-evidence-backend`
  - backend image metadata JSON
  - backend Trivy image JSON report
  - backend CycloneDX SBOM
- `swarm-delivery-contract`
  - `release-manifest.json` with exact immutable frontend/backend image refs for future CD
  - `swarm-deployment-inputs.env` with shell-friendly deployment variables

Artifact-to-rubric mapping and report guidance are documented in [`docs/CI_EVIDENCE_MAP.md`](docs/CI_EVIDENCE_MAP.md).
Future CD secret and image-consumption rules are documented in [`docs/CD_SWARM_CONTRACT.md`](docs/CD_SWARM_CONTRACT.md).


