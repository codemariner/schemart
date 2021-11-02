export interface Table {
	tableName: string;
	tableType: string;
}

export interface Enum {
	name: string;
	values: string[];
}

export interface Column {
	name: string;
	dataType: string;
	isNullable: boolean;
	defaultValue: string | null;
	description: string | null;
	isArray: boolean;
}

export type TableWithColumns<C extends Column = Column> = Table & {
	columns: C[];
};

export interface SchemaInfo {
	tables?: TableWithColumns[];
	enums?: Enum[];
}
