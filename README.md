<p align="center">
<img src="https://user-images.githubusercontent.com/33014/151277543-07b92bf4-6db7-4620-ad78-d0ce2e36d98b.png"/>
</p>

---
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io) [![Version](https://img.shields.io/npm/v/schemart.svg)](https://npmjs.org/package/schemart) [![Downloads/month](https://img.shields.io/npm/dm/schemart.svg)](https://npmjs.org/package/schemart) [![License](https://img.shields.io/npm/l/schemart.svg)](https://github.com/codemariner/schemart/blob/master/package.json)

Generate runtime types and TypeScript from your database schema. Currently, this supports generating runtime definitions as [runtypes](https://github.com/pelotom/runtypes) from PostgreSQL, MySQL, and SQL Server.

### Example
Given the following table:
```sql
CREATE TYPE gender AS ENUM ('male', 'female');

CREATE TABLE app.user (
    id serial NOT NULL,
    email text NOT NULL,
    availability tsrange NULL,
    gender gender NULL
);
```

and schemart YAML configuration file with type customizations:
```yaml
databaseType: 'postgres'
schema: 'app'
outfile: './schema.ts'
runtimeType: 'runtypes'
enumsAsTypes: true
includeViews: false
extraInfo:
  indexes: false
  dataType: false
excludeTables:
  - schema_migrations
content:
  import { Interval } from 'luxon';

  function isInterval(value:unknown): value is Interval {
    return value instanceof Interval;
  }
  const IntervalRt = rt.Unknown.withGuard(isInterval);

typeMappings:
  'tsrange':
    runtype: IntervalRt
```

run command:
```
$ schemart -f ./schemart.yaml -u postgres://user@localhost/my_db
```

generated ts file:
```typescript
// generated from schemart
import * as rt from 'runtypes';
import { Interval } from 'luxon';

function isInterval(value:unknown): value is Interval {
  return value instanceof Interval;
}
const IntervalRt = rt.Unknown.withGuard(isInterval);

export const GenderEnum = rt.Union(
  rt.Literal('male'),
  rt.Literal('female')
);
export type Gender = Static<typeof GenderEnum>;

export const User = rt.Record({
  id: rt.Number,
  email: rt.String,
  availability: rt.Optional(IntervalRt.Or(rt.Null)), // custom Interval type
  gender: rt.Optional(GenderEnum.Or(rt.Null))
});
export type User = rt.Static<typeof User>;
```

where the resulting `type User` is inferred as:
```typescript
type Users = {
    id: number
    email: string
    availability?: Interval
    gender?: "male" | "female"
}
```

## Why use this?

You want to have generated TypeScript types that match your database schema **and** you want to ensure that data you've retrieved from the database matches those types. Generated types won't matter if the data returned from your queries don't match those types at runtime. For example:

```typescript
const User = Record({
    id: Number,
    name: String,
    phoneNumber: String
});
type User = Static<typeof User>;

const { rows } = db.query(' SELECT id, name, phone_number FROM users; ')

// fails because 'phone_number' does not match the expected 'phoneNumber' field in User.
const users:User[] = rows.map((row) => User.check(row));
```

## Install

```
npm install --save-dev schemart
```
or 
```
yarn add -D schemart
```

## Dependencies

SchemaRT does not install driver dependencies. You must install one or more of the following drivers:

* 'pg' - for PostgreSQL
* 'mysql2' - for MySQL
* 'mssql' - for SQL Server

## Configuration

Configuration options are stored in a YAML file.

* `databaseType`: _required_ - Possible values: `postgres`, `mysql`, `mssql`
* `outfile`: _required_ - path to the output file to write type definitions to. This can be a relative path (to the yaml file itself)
* `runtimeType`: _required_ - The type of runtime type system to target. Currently, only `runtypes` is supported.
* `camelCase`: _optional_ - Whether or not to convert database object names to camelCase. Default true.
* `dbUri`: _optional_ - Database connection string. This can be passed in through the command line.
* `extraInfo`: _optional_ - Whether or not to include additional information. Includes one of:
  * `indexes`: _optional_ - include index names in field comments.
  * `dataType`: _optional_ - include index names in field comments.
* `excludeTables`: _optional_ array - A list of tables to exclude from type generation.
* `enumsAsTypes`: _optional_ boolean - whether or not to generate enum values as a typescript enum or union literal type. This is not supported in mssql.
* `includeViews`: _optional_ boolean - Whether or not to include views when generating types. Defaults to `false`.
* `content`: _optional_ - Custom content that will be inserted at the top of the generated ts file.
* `typeMappings`: _optional_ - Map of database type names to target type information. Use this to provide custom type mapping from some database type. For example:
  ```yaml
  typeMappings:
    tsrange:
      runtype: IntervalRT
  ```
  * `{data type name}`:
    * `runtype: {type name}` 

#### postgres
Additional configurations:
 * `schema` - The name of the schema to target. This defaults to 'public'.
 * `includeForeignTables` - whether or not to include foreign tables.

#### mssql
Additional configurations:
 * `schema` - The name of the schema to target. This defaults to 'dbo'.

## CLI
```
USAGE
  $ schemart

OPTIONS
  -d, --dryRun                 Perform all operations but don't actually generate output
  -f, --configFile=configFile  (required) Path to configuration file
  -u, --dbUri=dbUri            Database URI. Overrides value in configuration files.
```

## Debugging
This uses the [debug](https://github.com/debug-js/debug) library. To enable debug output set the DEBUG environment variable:
```
DEBUG=schemart* schemart -f ./foo.yaml -u postgres://localhost
```
