import baseDebug from '../../debug';
import { SchemaProvider } from '../../schema-provider';
import { getType } from '../util';

import { MssqlColumn, MssqlConfig, MysqlSchemaInfo } from './types';

const debug = baseDebug.extend('schema-providers/mssql');

export const getDataType: SchemaProvider['getDataType'] = (
	_config: MssqlConfig,
	column: MssqlColumn
): string => column.dataType;

export const mapToRuntype: SchemaProvider['mapToRuntype'] = (
	{ runtimeType }: MssqlConfig,
	_schemaInfo: MysqlSchemaInfo,
	column: MssqlColumn
): string => {
	debug('mapToRunType column', column.name);
	switch (column.dataType) {
		// numerical types
		case 'bigint':
		case 'bit':
		case 'decimal':
		case 'int':
		case 'float':
		case 'money':
		case 'numeric':
		case 'real':
		case 'smallint':
		case 'smallmoney':
		case 'tinyint':
			return getType(runtimeType, 'number');

		// character types
		case 'char':
		case 'nchar':
		case 'ntext':
		case 'nvarchar':
		case 'text':
		case 'time':
		case 'timestamp':
		case 'varchar':
			return getType(runtimeType, 'string');

		// date/time types
		case 'date':
		case 'datetime':
		case 'datetime2':
		case 'datetimeoffset':
		case 'smalldatetime':
			return getType(runtimeType, 'Date');

		// binary types
		case 'binary':
		case 'varbinary':
		case 'image':
			return getType(runtimeType, 'unknown');
		// misc other types
		case 'geography':
		case 'geometry':
		case 'hierarchyid':
		case 'sql_variant':
		case 'uniqueidentifier':
		case 'xml':
		default: {
			return getType(runtimeType, 'unknown');
		}
	}
};
