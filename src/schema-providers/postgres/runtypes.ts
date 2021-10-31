import camelcase from 'lodash.camelcase';
import capitalize from 'lodash.capitalize';

import { Column } from '../../schema-info';
import { SchemaProvider } from '../../schema-provider';

import { PostgresConfig, PostgresSchemaInfo } from './types';

export const mapToRuntype: SchemaProvider['mapToRuntype'] = (
	_config: PostgresConfig,
	schemaInfo: PostgresSchemaInfo,
	column: Column
): string => {
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
		case 'name':
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
