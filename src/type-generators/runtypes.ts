/* eslint-disable no-console */
import camelcase from 'lodash.camelcase';

import { Config } from '../config';
import baseDebug from '../debug';
import { Enum, SchemaInfo, TableWithColumns } from '../schema-info';
import { SchemaProvider } from '../schema-provider';
import { camelize } from '../util';

import { GenerateOpts, GeneratorFn } from './types';

type MapToRuntypeFn = SchemaProvider['mapToRuntype'];
type GetDataTypeFn = SchemaProvider['getDataType'];

type TransformOpts = Pick<Config, 'camelCase'>;

const debug = baseDebug.extend('type-generators/runtypes');

const ObjStartTag = (type: string): string => `${type}({\n`;

const ObjEndTag = (): string => `})`;

function transformEnum(opts: TransformOpts, enumInfo: Enum): string {
	debug('transformEnum', enumInfo);
	const name = opts.camelCase ? camelize(enumInfo.name) : enumInfo.name;
    let result = '';
    if (enumInfo.description) {
        result += `
/**
 * ${enumInfo.description.split('\n').join('\n * ')}
 */\n`
    }
	result += `export enum ${name} {\n`;
	result += enumInfo.values.map((value): string => `  ${value}`).join(',\n');
	result += '\n}\n';

	result += `function is${name}(value:unknown): value is ${name} {
  return Object.values(${name}).includes(value as ${name});
}\n`;
	result += `export const ${name}Enum = rt.Unknown.withGuard(is${name});\n\n`;
	return result;
}

function transformEnumAsUnion(opts: TransformOpts, enumInfo: Enum): string {
	debug('transformEnumAsUnion', enumInfo);
	const name = opts.camelCase ? camelize(enumInfo.name) : enumInfo.name;
    let result = '';
    if (enumInfo.description) {
        result += `
/**
 * ${enumInfo.description.split('\n').join('\n * ')}
 */\n`
    }
	result += `export const ${name}Enum = rt.Union(\n`;
	enumInfo.values.forEach((val, idx) => {
		if (idx > 0) {
			result += ',\n';
		}
		result += `  rt.Literal('${val}')`;
	});
	result += '\n);\n';
	result += `export type ${name} = rt.Static<typeof ${name}Enum>;\n\n`;
	return result;
}

function transformTable(
	config: Config,
	table: TableWithColumns,
	schemaInfo: SchemaInfo,
	mapToRuntype: MapToRuntypeFn,
	getDataType: GetDataTypeFn
): string {
	const tableName = config.camelCase ? camelize(table.tableName) : table.tableName;
	let result = '';
	if (table.description) {
		result += `
/**
 * ${table.description.split('\n').join('\n * ')}
 */\n`;
	}
	result += `export const ${tableName} = `;
	result += ObjStartTag('rt.Record');
	table.columns.forEach((col) => {
		const name = config.camelCase ? camelcase(col.name) : col.name;
		const optional = col.isNullable;

		const columnDataType = getDataType(config, col);
		const customType = config.typeMappings?.[columnDataType]?.runtype;

		let valueType = customType || mapToRuntype(config, schemaInfo, col);

		if (optional) {
			valueType = `rt.Optional(${valueType}.Or(rt.Null))`;
		}

		const commentLines = [];
		if (col.description) {
			commentLines.push(`${col.description.replace(/\n/g, ' ').trim()}`);
		}
		if (config.extraInfo?.dataType) {
			commentLines.push(`type: ${col.rawType}`);
		}
		if (config.extraInfo?.indexes) {
			col.indexes?.forEach((index) => {
				commentLines.push(`idx: ${index.name}`);
			});
		}
		if (commentLines.length) {
			result += `  /**\n`;
			result += commentLines.map((l) => `   * ${l}\n`).join('');
			result += `   */\n`;
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

const customTypes = `
// custom schemart types
const srt = {
    Date: rt.Unknown.withGuard((x:unknown):x is Date => x instanceof Date)
}

`;

const generate: GeneratorFn = ({
	config,
	schemaInfo,
	mapToRuntype,
	getDataType,
}: GenerateOpts): string => {
	debug('generating type specs');
	const { enums, tables } = schemaInfo;
	let result = header;
	result += `${config.content ?? ''}\n${customTypes}`;

	enums?.forEach((enumInfo) => {
		debug('transforming enum', enumInfo.name);
		if (config.enumsAsTypes) {
			result += transformEnumAsUnion(config, enumInfo);
		} else {
			result += transformEnum(config, enumInfo);
		}
	});

	tables?.forEach((table) => {
		debug('transforming table', table.tableName);
		result += transformTable(config, table, schemaInfo, mapToRuntype, getDataType);
	});
	return result;
};

export default generate;
