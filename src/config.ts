import { Array, Boolean, Literal, Optional, Record, Static, String, Union } from 'runtypes';

import { DatabaseType } from './schema-providers/database-types';

const RuntimeType = Union(Literal('runtypes'));

export const Config = Record({
	databaseType: DatabaseType,
	outfile: String,
	dbUri: Optional(String),
	includeViews: Optional(Boolean),
	excludeTables: Optional(Array(String)),
	enumsAsTypes: Optional(Boolean),
	runtimeType: RuntimeType,
});

export type Config = Static<typeof Config>;
