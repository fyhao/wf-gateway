# wf-gateway

Experimental workflow gateway service. It consists of three Node.js services:

| Service | Purpose | Default port |
| --- | --- | --- |
| `wf-control` | Management API for applications, flows, listeners and instances | `8080` |
| `wf-app` | Runtime that executes deployed workflows | `8081` |
| `wf-admin` | React-based administration UI | `3000` |

## Run locally

Install dependencies in each service directory, then start the control and app
runtime in separate terminals:

```bash
cd wf-control && npm install && npm start
cd wf-app && npm install && npm start
cd wf-admin && npm ci --legacy-peer-deps && npm start
```

Both backend services accept a `--port` (or `-p`) argument. For example,
`node app.js --port 9081` starts `wf-app` on port 9081. The control service
stores configuration in memory by default; use `POST /datasource` to point it
at a configured database-backed datastore.

## Docker

Build each image from its own service directory:

```bash
docker build -t wf-control ./wf-control
docker build -t wf-app ./wf-app
docker build -t wf-admin ./wf-admin

docker run --rm -p 8080:8080 wf-control
docker run --rm -p 8081:8081 wf-app
docker run --rm -p 3000:80 wf-admin
```

Backend images use Node 22 and run as the `node` user. The admin image builds
the React application and serves it using Nginx on port 80. Use npm lockfiles
for reproducible installs; the admin requires `npm ci --legacy-peer-deps`.

## Control API

The control API is served by `wf-control`. Frequently used endpoints are:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET`, `POST` | `/app` | List or create applications |
| `GET`, `PUT`, `DELETE` | `/app/:name` | Read, update or remove an application |
| `GET`, `POST` | `/app/:name/flow` | List or replace an application's flows |
| `GET`, `POST` | `/app/:name/listener` | List or create HTTP listeners |
| `GET`, `POST` | `/instance` | List or create runtime instances |
| `POST` | `/instance/:id/deploy` | Deploy a configuration to an instance |
| `GET` | `/monitor/info` | Retrieve runtime monitoring information |

All management endpoints expect JSON request bodies where applicable.

## Tests

Run unit tests from the service directory:

```bash
cd wf-app && npm test
cd wf-control && npm test
cd e2e && npm test
```

The e2e suite starts both backend services and verifies application creation,
deployment and listener routing end to end.

## SQL step

The `sql` step executes SQL statements against relational databases. The step
reads the datasource configuration from the execution context and supports
**MSSQL**, **MySQL** and **Oracle** databases.

Example:

```json
{
  "type": "sql",
  "ds": "mydb",
  "sql": "select * from users where id = ?",
  "fields": [1],
  "recordsets": ["id", "name"],
  "result": "userRows"
}
```

Query results are stored in the variable specified by `result` and any column
listed in `recordsets` will also be available as individual variables.

## Management authentication

Node 22 or newer is required. Create a password hash by piping a password to
`node scripts/hash-password.js` (the script requires 12–1024 characters). Store
only the resulting scrypt hash in a private JSON file outside the repository:

```json
{
  "users": [{"username":"operator","passwordHash":"<scrypt hash>","groups":["operators"]}],
  "groups": {"operators":["administrator"]},
  "roles": {"administrator":["*"]}
}
```

Set `WF_AUTH_FILE=/absolute/path/auth.json` when starting `wf-control`.
Without this variable, legacy development mode leaves authentication disabled.
An application can instead pass `auth` into `createServer`; `auth.enabled` is
explicit in that configuration. Permissions are `app:read`, `app:edit`,
`instance:read`, `instance:edit`, `backup:read`, `backup:edit`, `monitor:read`,
`datasource:read` and `datasource:edit`. A user can have direct `roles` and/or
`groups`. A separately configured `superadmin: true` user still needs valid
credentials. Programmatic `verifySecondFactor(user, proof)` supports external
MFA providers; `mfaRequired: true` denies login without a successful verifier.

`POST /auth/login` accepts `username`, `password` and optional `secondFactor`.
Use its `accessToken` in `Authorization: Bearer <token>` on management requests.
`POST /auth/logout` revokes it; `GET /auth/status` reports whether auth is enabled.
The React UI signs in using these same endpoints and keeps tokens in memory.
Set `REACT_APP_API_URL` at build time to select its control API URL.

Set the same `WF_RUNTIME_TOKEN` on control and app runtimes to protect runtime
management endpoints. Configure HTTPS at your ingress when accessing remotely.

## Lifecycle, logs, uploads and demo

Lifecycle listener types are `deploy.init`, `app.init`, `app.destroy`, and
`deploy.done`; `app_init` remains an alias. A lifecycle workflow can read
`lifecycleEvent`. Replace/disable invokes destroy on the previous enabled app;
init/done apply to the next enabled app. Hooks are awaited before success, with
a five-second per-hook timeout. Do not use a lifecycle hook to send an HTTP
response. External hook side effects are not rolled back automatically.

The `log` step now records an instance-local tail. Set `WF_LOG_FILE` for local
NDJSON persistence. Retrieve the latest lines at `GET /control/logs?limit=100`
on a runtime or `GET /instance/:id/logs?limit=100` on control; an optional `app`
query filters rows. The admin **Logs** page selects an instance and line count.

To accept a file, set `WF_UPLOAD_DIR` on the runtime and configure a POST HTTP
listener pointing to a flow named, for example, `receiveFile`:

```json
{"steps":[
  {"type":"upload","var":"file"},
  {"type":"response","body":"{{JSON.stringify(file)}}"}
]}
```

Send the file bytes with `Content-Type: application/octet-stream`. The result
contains `id`, `size` and `sha256`; original filenames are never used as paths.
The default limit is 5 MiB (`uploadMaxBytes` in the programmatic server options).
Workflow names override built-in step names, so do not name this flow `upload`.

For the load-balancer demo, start control on 8080 and three app processes on
8081, 8082 and 8083. Import `examples/load-balancer.json` via the admin import
page, deploy all configurations to each instance, then call
`http://localhost:8081/home`. The gateway alternates between the two backends.

The [backlog review](docs/backlog-review-2026-11-15.md) records issue-by-issue
outcomes, verification and boundaries, including retired 2018 initiatives.
