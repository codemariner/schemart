import baseDebug from '../../debug';
import { SchemaProvider } from '../../schema-provider';

import { MssqlColumn, MssqlConfig, MysqlSchemaInfo } from './types';

const debug = baseDebug.extend('schema-providers/postgres');

export const getDataType: SchemaProvider['getDataType'] = (
	_config: MssqlConfig,
	column: MssqlColumn
): string => column.dataType;

export const mapToRuntype: SchemaProvider['mapToRuntype'] = (
	_config: MssqlConfig,
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
			return 'rt.Number';

		// character types
		case 'char':
		case 'nchar':
		case 'ntext':
		case 'nvarchar':
		case 'text':
		case 'time':
		case 'timestamp':
		case 'varchar':
			return 'rt.String';

		// date/time types
		// we don't convert these because drivers don't convert (by default)
		case 'date':
		case 'datetime':
		case 'datetime2':
		case 'datetimeoffset':
		case 'smalldatetime':
			return 'rt.String';

		// binary types
		case 'binary':
		case 'varbinary':
		case 'image':
			return 'rt.Unknown';
		// misc other types
		case 'geography':
		case 'geometry':
		case 'hierarchyid':
		case 'sql_variant':
		case 'uniqueidentifier':
		case 'xml':
		default: {
			return 'rt.Unknown';
		}
	}
};
