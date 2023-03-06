import { Config } from '../config';
import { SchemaInfo } from '../schema-info';
import { SchemaProvider } from '../schema-provider';

export type MapToRuntypeFn = SchemaProvider['mapToRuntype'];
export type GetDataTypeFn = SchemaProvider['getDataType'];

export interface GenerateOpts {
	config: Config;
	schemaInfo: SchemaInfo;
	mapToRuntype: MapToRuntypeFn;
	getDataType: GetDataTypeFn;
}

export interface GeneratorFn {
	({ config, schemaInfo, mapToRuntype, getDataType }: GenerateOpts): string;
}
