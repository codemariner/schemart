import { SchemaProvider } from '../schema-provider';

import { DatabaseType } from './database-types';
import { MysqlSchemaProvider } from './mysql';
import { PostgresSchemaProvider } from './postgres';

export const schemaProviders: Record<DatabaseType, SchemaProvider> = {
	postgres: PostgresSchemaProvider,
	mysql: MysqlSchemaProvider,
	// 'mysql': MysqlSchemaProvider,
	// 'mssql': MssqlSchemaProvider,
};
