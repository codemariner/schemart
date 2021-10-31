import { Literal, Static, Union } from 'runtypes';

import { SchemaProvider } from '../schema-provider';

import { PostgresSchemaProvider } from './postgres';

export const DatabaseType = Union(Literal('postgres'));
export type DatabaseType = Static<typeof DatabaseType>;

export const schemaProviders: Record<DatabaseType, SchemaProvider> = {
	postgres: PostgresSchemaProvider,
	// 'mysql': MysqlSchemaProvider,
	// 'mssql': MssqlSchemaProvider,
};
