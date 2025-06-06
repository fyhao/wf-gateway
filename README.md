# wf-gateway

Experimental workflow gateway service.

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
