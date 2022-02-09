/* eslint-disable import/no-extraneous-dependencies */
import {
	Array,
	Boolean,
	Dictionary,
	Literal,
	Optional,
	Partial,
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

const ExtraInfo = Partial({
	indexes: Boolean,
	dataType: Boolean,
});

export const Config = Record({
	camelCase: Optional(Boolean),
	databaseType: DatabaseType,
	runtimeType: RuntimeType,
	outfile: String,
	dbUri: Optional(String),
	enumsAsTypes: Optional(Boolean),
	includeViews: Optional(Boolean),
	extraInfo: Optional(ExtraInfo),
	excludeTables: Optional(Array(String)),
	content: Optional(String),
	typeMappings: Optional(TypeMappings),
});

export type Config = Static<typeof Config>;
