import baseDebug from '../../debug';
import { SchemaProvider } from '../../schema-provider';
import { camelize } from '../../util';

import { MssqlColumn, MssqlConfig, MysqlSchemaInfo } from './types';

const debug = baseDebug.extend('schema-providers/postgres');

export const getDataType: SchemaProvider['getDataType'] = (
	_config: MssqlConfig,
	column: MssqlColumn
): string => column.dataType;

export const mapToRuntype: SchemaProvider['mapToRuntype'] = (
	_config: MssqlConfig,
	schemaInfo: MysqlSchemaInfo,
	column: MssqlColumn
): string => {
	debug('mapToRunType column', column.name);
	const { enums } = schemaInfo;
	if (column.dataType === 'USER-DEFINED') {
		const enumName = camelize(column.dataType);
		const enumInfo = enums?.find((e) => e.name === column.dataType);
		if (!enumInfo) {
			console.warn(`user defined type ${column.dataType} is unknown.`);
			return 'rt.Unknown';
		}
		return `${enumName}Enum`;
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
			return 'rt.String';
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
			return 'rt.Number';
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
			return 'rt.Unknown';
		}
	}
};
