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

function transformEnum(opts: TransformOpts, enumInfo: Enum): string {
	debug('transformEnum', enumInfo);
	const name = opts.camelCase ? camelize(enumInfo.name) : enumInfo.name;
	let result = `export enum ${name} {\n`;
	result += enumInfo.values.map((value): string => `  ${value}`).join(',\n');
	result += '\n}\n';

	return result;
}

function transformEnumAsUnion(opts: TransformOpts, enumInfo: Enum): string {
	debug('transformEnumAsUnion', enumInfo);
	const name = opts.camelCase ? camelize(enumInfo.name) : enumInfo.name;
	let result = `export type ${name} = ${enumInfo.values.map((val) => `'${val}'`).join(' | ')}`;
	result += '\n\n';
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
 * ${table.description}
 */\n`;
	}
	result += `export interface ${tableName} {\n`;
	table.columns.forEach((col) => {
		const name = config.camelCase ? camelcase(col.name) : col.name;
		const optional = col.isNullable;

		const columnDataType = getDataType(config, col);
		const customType = config.typeMappings?.[columnDataType]?.runtype;

		let valueType = customType || mapToRuntype(config, schemaInfo, col);

		if (optional) {
			valueType = `${valueType} | null`;
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
		result += `  ${name}${optional ? '?' : ''}: ${valueType};\n`;
	});
	result += '};\n\n';
	return result;
}

const generate: GeneratorFn = ({
	config,
	schemaInfo,
	mapToRuntype,
	getDataType,
}: GenerateOpts): string => {
	debug('generating type specs');
	const { enums, tables } = schemaInfo;
	let result = '';
	result += `${config.content ?? ''}\n`;

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

export interface Users {
	id: number;
	name: string;
	email: string;
	emailValidated?: boolean | null;
	/**
	 * The range of time the user is considered available.
	 */
	metadata: unknown;
	createAt: string;
	updatedAt: string;
}

export default generate;
