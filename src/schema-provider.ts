import { Runtype } from 'runtypes';

import { Config } from './config';
import { Column, SchemaInfo } from './schema-info';

export interface SchemaProvider<T extends Config = Config, S extends SchemaInfo = SchemaInfo> {
	name: string;
	configRt: Runtype<T>;
	getDbSchema(config: T): Promise<S>;
	mapToRuntype(config: T, schemaInfo: S, column: Column): string;

	/**
	 * Return the canonical data type name of the column. This is particularly used to indicate the target
	 * type for custom type mappings.
	 *
	 * @param config
	 * @param column
	 */
	getDataType(config: T, column: Column): string;
}
