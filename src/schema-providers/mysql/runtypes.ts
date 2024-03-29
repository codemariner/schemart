import baseDebug from '../../debug';
import { SchemaProvider } from '../../schema-provider';
import { camelize } from '../../util';
import { getType } from '../util';

import { MysqlColumn, MysqlConfig, MysqlSchemaInfo } from './types';

const debug = baseDebug.extend('schema-providers/postgres');

export const getDataType: SchemaProvider['getDataType'] = (
	_config: MysqlConfig,
	column: MysqlColumn
): string => column.dataType;

export const mapToRuntype: SchemaProvider['mapToRuntype'] = (
	{ runtimeType }: MysqlConfig,
	schemaInfo: MysqlSchemaInfo,
	column: MysqlColumn
): string => {
	debug('mapToRunType column', column.name);
	const { enums } = schemaInfo;
	if (column.dataType === 'USER-DEFINED') {
		const enumName = camelize(column.dataType);
		const enumInfo = enums?.find((e) => e.name === column.dataType);
		if (!enumInfo) {
			console.warn(`user defined type ${column.dataType} is unknown.`);
			return getType(runtimeType, 'unknown');
		}
		return runtimeType === 'runtypes' ? `${enumName}Enum` : enumName;
	}
	switch (column.dataType) {
		case 'char':
		case 'varchar':
		case 'text':
		case 'tinytext':
		case 'mediumtext':
		case 'longtext':
		case 'time':
		case 'geometry':
		case 'set':
		case 'enum':
		case 'date':
		case 'datetime':
		case 'timestamp':
			// keep set and enum defaulted to string if custom type not mapped
			return getType(runtimeType, 'string');
		case 'integer':
		case 'int':
		case 'smallint':
		case 'mediumint':
		case 'bigint':
		case 'double':
		case 'decimal':
		case 'numeric':
		case 'float':
		case 'year':
		case 'tinyint':
			return getType(runtimeType, 'number');
		// binary as buffer or string
		case 'tinyblob':
		case 'mediumblob':
		case 'longblob':
		case 'blob':
		case 'binary':
		case 'varbinary':
		case 'bit':
		case 'json':
		default: {
			return getType(runtimeType, 'unknown');
		}
	}
};
