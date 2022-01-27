import { SchemaProvider } from '../../schema-provider';

import { getDbSchema } from './database';
import { PostgresConfig } from './types';
import { getDataType, mapToRuntype } from './runtypes';

export const PostgresSchemaProvider: SchemaProvider<PostgresConfig> = {
	name: 'postgres',
	configRt: PostgresConfig,
	getDbSchema,
	mapToRuntype,
	getDataType,
};

export default PostgresSchemaProvider;
