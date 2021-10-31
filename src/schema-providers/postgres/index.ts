import { SchemaProvider } from '../../schema-provider';

import { getDbSchema } from './database';
import { PostgresConfig } from './types';
import { mapToRuntype } from './runtypes';

export const PostgresSchemaProvider: SchemaProvider<PostgresConfig> = {
	name: 'postgres',
	configRt: PostgresConfig,
	// eslint-disable-next-line arrow-body-style
	getDbSchema,
	mapToRuntype,
};
