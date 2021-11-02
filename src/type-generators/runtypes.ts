/* eslint-disable no-console */
import camelcase from 'lodash.camelcase';
import capitalize from 'lodash.capitalize';

import { Config } from '../config';
import baseDebug from '../debug';
import { Enum, SchemaInfo, TableWithColumns } from '../schema-info';
import { SchemaProvider } from '../schema-provider';

type MapToRuntypeFn = SchemaProvider['mapToRuntype'];
type GetDataTypeFn = SchemaProvider['getDataType'];

export interface GenerateOpts {
	config: Config;
	schemaInfo: SchemaInfo;
	mapToRuntype: MapToRuntypeFn;
	getDataType: GetDataTypeFn;
}

const debug = baseDebug.extend('type-generators/runtypes');

const ObjStartTag = (type: string): string => `${type}({\n`;

const ObjEndTag = (): string => `})`;

function transformEnum(enumInfo: Enum): string {
	const name = capitalize(camelcase(enumInfo.name));
	let result = `export enum ${name} {\n`;
	result += enumInfo.values.map((value): string => `  ${value}`).join(',\n');
	result += '\n}\n';

	result += `function is${name}(value:unknown): value is ${name} {
  return Object.values(${name}).includes(value as ${name});
}\n`;
	result += `export const ${name}Enum = rt.Unknown.withGuard(is${name});\n\n`;
	return result;
}

function transformEnumAsUnion(enumInfo: Enum): string {
	const name = capitalize(camelcase(enumInfo.name));
	let result = `export const ${name}Enum = rt.Union(\n`;
	enumInfo.values.forEach((val, idx) => {
		if (idx > 0) {
			result += ',\n';
		}
		result += `  rt.Literal('${val}')`;
	});
	result += '\n);\n';
	result += `export type ${name} = \n`;
	result += enumInfo.values.map((val) => `  '${val}'`).join(' |\n');
	result += ';\n\n';
	return result;
}

function transformTable(
	config: Config,
	table: TableWithColumns,
	schemaInfo: SchemaInfo,
	mapToRuntype: MapToRuntypeFn,
	getDataType: GetDataTypeFn
): string {
	const tableName = capitalize(camelcase(table.tableName));
	let result = `export const ${tableName} = `;
	result += ObjStartTag('rt.Record');
	table.columns.forEach((col) => {
		const name = camelcase(col.name);
		const optional = col.isNullable;

		const columnDataType = getDataType(config, col);
		const customType = config.typeMappings?.[columnDataType]?.runtype;

		let valueType = customType || mapToRuntype(config, schemaInfo, col);

		if (optional) {
			valueType = `rt.Optional(${valueType}.Or(rt.Null))`;
		}
		if (col.description) {
			result += `  // ${col.description.replaceAll('\n', ' ').trim()}`;
		}
		result += `  ${name}: ${valueType},\n`;
	});
	result += ObjEndTag();
	result += ';\n';
	result += `export type ${tableName} = rt.Static<typeof ${tableName}>;\n\n`;
	return result;
}

const header = `
// generated from schemart
import * as rt from 'runtypes';
`;

export function generate({ config, schemaInfo, mapToRuntype, getDataType }: GenerateOpts): string {
	debug('generating type specs');
	const { enums, tables } = schemaInfo;
	let result = header;
	result += `${config.content ?? ''}\n`;

	enums?.forEach((enumInfo) => {
		debug('transforming enum', enumInfo.name);
		if (config.enumsAsTypes) {
			result += transformEnumAsUnion(enumInfo);
		} else {
			result += transformEnum(enumInfo);
		}
	});

	tables?.forEach((table) => {
		debug('transforming table', table.tableName);
		result += transformTable(config, table, schemaInfo, mapToRuntype, getDataType);
	});
	return result;
}
