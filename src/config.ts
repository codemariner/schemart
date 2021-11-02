/* eslint-disable import/no-extraneous-dependencies */
import {
	Array,
	Boolean,
	Dictionary,
	Literal,
	Optional,
	Record,
	Static,
	String,
	Union,
} from 'runtypes';

import { DatabaseType } from './schema-providers/database-types';

const RuntimeType = Union(Literal('runtypes'));

const TypeMap = Record({
	runtype: String,
});
const TypeMappings = Dictionary(TypeMap, String);

export const Config = Record({
	databaseType: DatabaseType,
	runtimeType: RuntimeType,
	outfile: String,
	dbUri: Optional(String),
	includeViews: Optional(Boolean),
	excludeTables: Optional(Array(String)),
	enumsAsTypes: Optional(Boolean),
	content: Optional(String),
	typeMappings: Optional(TypeMappings),
});

export type Config = Static<typeof Config>;
