/* eslint-disable no-console */
import camelcase from 'lodash.camelcase';
import capitalize from 'lodash.capitalize';

import { Config } from '../config';
import { Enum, SchemaInfo, TableWithColumns } from '../schema-info';
import { SchemaProvider } from '../schema-provider';

type MapToRuntypeFn = SchemaProvider['mapToRuntype'];

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
	mapToRuntype: MapToRuntypeFn
): string {
	const tableName = capitalize(camelcase(table.tableName));
	let result = `export const ${tableName} = `;
	result += ObjStartTag('rt.Record');
	table.columns.forEach((col) => {
		const name = camelcase(col.name);
		const optional = col.isNullable;
		let value = mapToRuntype(config, schemaInfo, col);
		if (optional) {
			value = `rt.Optional(${value}.Or(rt.Null))`;
		}
		if (col.description) {
			result += `  // ${col.description.replaceAll('\n', ' ').trim()}`;
		}
		result += `  ${name}: ${value},\n`;
	});
	result += ObjEndTag();
	result += ';\n';
	result += `export type ${tableName} = rt.Static<typeof ${tableName}>;\n\n`;
	return result;
}

export function generate(
	config: Config,
	schemaInfo: SchemaInfo,
	mapToRuntype: MapToRuntypeFn
): string {
	const { enums, tables } = schemaInfo;
	let result = '// generated from schemart\n\n';
	result += "import * as rt from 'runtypes';\n\n";
	enums?.forEach((enumInfo) => {
		if (config.enumsAsTypes) {
			result += transformEnumAsUnion(enumInfo);
		} else {
			result += transformEnum(enumInfo);
		}
	});
	tables?.forEach((table) => {
		result += transformTable(config, table, schemaInfo, mapToRuntype);
	});
	return result;
}
