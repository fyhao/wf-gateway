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
cd wf-admin && npm install && npm start
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
docker run --rm -p 3000:3000 wf-admin
```

The images use the repository's legacy `node:carbon` base image. Keep that in
mind when deploying: updating the base image and dependency set should be a
separate compatibility-tested change.

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
