import { Optional, Record, Static, String } from 'runtypes';

import { Config } from '../../config';
import { Column, SchemaInfo, TableWithColumns } from '../../schema-info';

export const PostgresConfig = Config.And(
	Record({
		schema: Optional(String),
		includeForeignTables: Optional(String),
	})
);
export type PostgresConfig = Static<typeof PostgresConfig>;

export interface PostgresColumn extends Column {
	udtName: string;
}
export interface PostgresSchemaInfo extends SchemaInfo {
	tables?: TableWithColumns<PostgresColumn>[];
}
