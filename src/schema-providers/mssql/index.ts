import { SchemaProvider } from '../../schema-provider';

import { getDbSchema } from './database';
import { MssqlConfig } from './types';
import { getDataType, mapToRuntype } from './runtypes';

export const MssqlSchemaProvider: SchemaProvider<MssqlConfig> = {
	name: 'mysql',
	configRt: MssqlConfig,
	getDbSchema,
	mapToRuntype,
	getDataType,
};
