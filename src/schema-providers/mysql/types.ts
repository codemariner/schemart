import { Boolean, Optional, Record, Static } from 'runtypes';

import { Config } from '../../config';
import { Column, SchemaInfo, TableWithColumns } from '../../schema-info';

export const MysqlConfig = Config.And(
    Record({
	    enumsAsTypes: Optional(Boolean),
    })
);
export type MysqlConfig = Static<typeof MysqlConfig>;

export type MysqlColumn = Column;

export interface MysqlSchemaInfo extends SchemaInfo {
	tables?: TableWithColumns<MysqlColumn>[];
}
