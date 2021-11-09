import camelcase from 'lodash.camelcase';

import baseDebug from '../../debug';
import { SchemaProvider } from '../../schema-provider';
import { capitalize } from '../../util';

import { PostgresColumn, PostgresConfig, PostgresSchemaInfo } from './types';

const debug = baseDebug.extend('schema-providers/postgres');

export const getDataType: SchemaProvider['getDataType'] = (
	_config: PostgresConfig,
	column: PostgresColumn
): string => column.udtName;

export const mapToRuntype: SchemaProvider['mapToRuntype'] = (
	_config: PostgresConfig,
	schemaInfo: PostgresSchemaInfo,
	column: PostgresColumn
): string => {
	debug('mapToRunType column', column.name);
	const { enums } = schemaInfo;
	if (column.dataType === 'USER-DEFINED') {
		const enumName = capitalize(camelcase(column.udtName));
		const enumInfo = enums?.find((e) => e.name === column.udtName);
		if (!enumInfo) {
			console.warn(`user defined type ${column.udtName} is unknown.`);
			return 'rt.Unknown';
		}
		return `${enumName}Enum`;
	}
	switch (column.udtName) {
		case 'bpchar':
		case 'char':
		case 'varchar':
		case 'text':
		case 'citext':
		case 'uuid':
		case 'bytea':
		case 'inet':
		case 'date':
		case 'timestamp':
		case 'timestamptz':
		case 'time':
		case 'timetz':
		case 'interval':
		case 'tsvector':
		case 'int4range':
		case 'int8range':
		case 'numrange':
		case 'tsrange':
		case 'tstzrange':
		case 'daterange':
			return 'rt.String';
		case 'int2':
		case 'int4':
		case 'int8':
		case 'float4':
		case 'float8':
		case 'numeric':
		case 'money':
		case 'oid':
			return 'rt.Number';
		case 'bool':
			return 'rt.Boolean';
		case 'json':
		case 'jsonb':
			return 'rt.Unknown';
		default:
			return 'rt.Unknown';
	}
};
