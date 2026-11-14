# WF Gateway backlog review — 15 November 2026

This change starts `main` from the existing `master` head `3098c4c`. It does not
change the repository's default branch or deploy any running service.

## Delivered work

| Issue | Result and evidence |
| --- | --- |
| #26 | Control API login/logout/status, opaque expiring bearer sessions, scrypt password hashes, user → group → role → permission checks, explicit authenticated superadmin recovery, rate limiting, and an optional MFA verifier that fails closed. The existing React admin uses the same flow. Auth integration tests cover roles, revocation, expiry, recovery, rate limiting and MFA. |
| #33 | Importable `examples/load-balancer.json` and deterministic `loadBalance` step. End-to-end coverage starts two real HTTP backends and verifies alternating responses. This is a round-robin demo, without health checking, failover or distributed counters. |
| #38 | `deploy.init`, `app.init`, `app.destroy`, `deploy.done` listeners, including legacy `app_init`. Deployments run serially, validate/compile routes first, await lifecycle flows, remove replaced endpoints and rebuild cron jobs. Integration tests verify event order, disable and redeployment. |
| #57 | Bounded runtime log rows with app/flow/timestamp/message; optional rotated NDJSON persistence via `WF_LOG_FILE`; protected runtime tail endpoint; control API proxy by instance ID; admin instance selector and last-line-count viewer. Unit/integration and React tests cover persistence, tail bounds, remote retrieval and text rendering. This supersedes the proposed SQL log table. |
| #63 | `upload` workflow step for bounded `application/octet-stream` requests. The runtime owns the storage directory, creates random opaque filenames using exclusive writes, computes SHA-256 and exposes metadata. Integration coverage verifies bytes, traversal-resistant filenames, wrong content type and oversize rejection. Multipart forms are not supported by this step. |
| #265 | Reviewed the runtime/admin, refreshed npm lockfiles, upgraded the admin HTTP/build dependencies and test runners, declared Node 22+, removed the obsolete Snyk install hooks and legacy Unirest/Request HTTP dependency, updated Docker recipes, and configured CI for `main`/`master` on Node 22/24. Added regression coverage and bounded recursive workflows. Removed the competing Yarn lockfile; use npm. |

## Previously withdrawn requests

On 9 August 2026, repository owner `fyhao` commented on all eight issues:
“This is outdated and no longer requires an update.” The two obsolete initiatives
below are retired explicitly rather than represented as completed implementations:

| Issue | Disposition |
| --- | --- |
| #46 — tns-wf-admin | Retire the withdrawn NativeScript project. The maintained React administration UI has mobile layout improvements and the existing application/listener/flow functions. A new native app, native iOS/Android builds and a NativeScript Docker project are **not** delivered. |
| #66 — 2018 Main Control milestone | Retire the withdrawn 2018 umbrella. Existing/new E2E coverage and authentication address part of the milestone, but MSSQL/Oracle/MongoDB **control datastores** and MongoDB workflow actions are **not** delivered. Existing MySQL control storage and runtime relational SQL adapters remain; no live database qualification was performed. |

## Operational boundaries

- The authentication switch remains disabled without `WF_AUTH_FILE`/`opts.auth`,
  preserving the existing local-development API contract. Configure it before
  exposing the control API; use TLS at the ingress. Restarting the process revokes
  its in-memory sessions. There is no persistent or multi-replica session store.
- Workflow authors are trusted operators: existing JavaScript workflow evaluation
  executes server-side code. RBAC is not a sandbox for untrusted workflow authors.
- Set `WF_RUNTIME_TOKEN` on control and runtime for deployment, monitor and log
  requests. Workflow HTTP routes have their own application access policies.
- Log persistence is a bounded local NDJSON file, not a central SQL database.
  A 10 MiB threshold compacts it to the latest in-memory rows. Do not log secrets.
- Uploads are opt-in via `WF_UPLOAD_DIR`, default to a 5 MiB request limit, and are
  local instance files. Retention/cleanup and malware scanning are deployment
  responsibilities; uploads are not exposed as static executable content.
- Lifecycle hooks execute workflow side effects. Syntax/route validation happens
  before publication, but hook side effects are not transactionally reversible.
  A failure after routes publish may leave the new deployment active; inspect
  `/control/deploy` with action `check` before retrying. There is no automatic
  rollback of external side effects.
- The runtime module is intended for one server per process. Database-backed,
  multi-process persistence and HA were not newly qualified.
- Admin Docker uses a build stage and Nginx port 80; Node service images use
  Node 22. Docker is not installed in this workspace, so image builds were not run.
- Local Chromium launch is blocked by the workspace's Unix-socket restriction.
  React DOM tests and the optimized build were verified; real-browser/mobile
  visual acceptance is not claimed. The production build emits an upstream
  Bootstrap `color-adjust` deprecation warning.
- Dependency refresh is not a claim that the legacy stack is vulnerability-free.
  Major migrations of React/Bootstrap and relational database libraries are
  separate compatibility work. See the validation notes below for audit results.

## Validation

| Check | Result |
| --- | --- |
| `npm test --prefix wf-control` | 98 passing |
| `npm test --prefix wf-app` | 33 passing |
| `npm test --prefix e2e` | 122 passing |
| `CI=true npm test --prefix wf-admin -- --watchAll=false --runInBand` | 5 passing across 3 suites |
| Clean admin `npm ci --ignore-scripts --legacy-peer-deps` | Passed |
| `npm run build --prefix wf-admin` | Passed; upstream Bootstrap CSS deprecation warning |
| `npm audit --omit=dev` in wf-control | 0 advisories after removing legacy HTTP client and refreshing dependencies |
| Admin dependency audit | 32 advisories (16 low, 5 moderate, 11 high) in the installed build/dependency tree; no claim of full remediation |
| `git diff --check` | Passed |

Local verification used Node 24.22.1. CI is configured for Node 22 and 24, but
remote CI results are not claimed here. All network integration tests target
local ephemeral servers and temporary files; production services and data are
not changed.
