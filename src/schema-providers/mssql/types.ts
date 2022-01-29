import { Optional, Record, Static, String } from 'runtypes';

import { Config } from '../../config';
import { Column, SchemaInfo, TableWithColumns } from '../../schema-info';

export const MssqlConfig = Config.And(
	Record({
		schema: Optional(String),
	})
);
export type MssqlConfig = Static<typeof MssqlConfig>;

export type MssqlColumn = Column & {
	isUserDefined: boolean;
};

export interface MysqlSchemaInfo extends SchemaInfo {
	tables?: TableWithColumns<MssqlColumn>[];
}
