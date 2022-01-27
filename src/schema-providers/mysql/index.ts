import { SchemaProvider } from '../../schema-provider';

import { getDbSchema } from './database';
import { MysqlConfig } from './types';
import { getDataType, mapToRuntype } from './runtypes';

export const MysqlSchemaProvider: SchemaProvider<MysqlConfig> = {
	name: 'mysql',
	configRt: MysqlConfig,
	getDbSchema,
	mapToRuntype,
	getDataType,
};

export default MysqlSchemaProvider;
