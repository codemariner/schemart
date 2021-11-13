SchemaRT
========

Generate runtime types and TypeScript from your database schema. Currently, this supports generating runtime type definitions as [runtypes](https://github.com/pelotom/runtypes) from PostgreSQL and MySQL.

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

You want to have generated TypeScript types that match your database schema **and** you want to ensure that data you've retrieved from the database matches those types. Particularly if you retrieve your data using raw queries.  For example:

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
npm install -g schemart
```
or 
```
yarn add schemart
```

<!--
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/schemart.svg)](https://npmjs.org/package/schemart)
[![Downloads/week](https://img.shields.io/npm/dw/schemart.svg)](https://npmjs.org/package/schemart)
[![License](https://img.shields.io/npm/l/schemart.svg)](https://github.com/codemariner/schemart/blob/master/package.json)
-->

## TODO
- Add general logging output
- Add config file generation support
- Add more documentation
- Add support for other databases
  - MSSQL
- Enhance mysql support
  - add index info support
  - ensure proper type mapping
  - validate against mysql 8
- Expose programatic api including ability to pass in client instance.
- Add support for other runtime types like:
  - valita
  - suretype
