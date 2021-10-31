import { SchemaProvider } from '../schema-provider';

import { DatabaseType } from './database-types';
import { PostgresSchemaProvider } from './postgres';

export const schemaProviders: Record<DatabaseType, SchemaProvider> = {
	postgres: PostgresSchemaProvider,
	// 'mysql': MysqlSchemaProvider,
	// 'mssql': MssqlSchemaProvider,
};
