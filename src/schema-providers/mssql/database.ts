import Bluebird from 'bluebird';
import mssql, { ConnectionPool } from 'mssql';

import baseDebug from '../../debug';
import { Table } from '../../schema-info';

import { MssqlColumn, MssqlConfig, MysqlSchemaInfo } from './types';

type Db = ConnectionPool;

const debug = baseDebug.extend('schema-providers/mssql');

function getSchema(config: Pick<MssqlConfig, 'schema'>): string {
	return config.schema ?? 'dbo';
}

function getColumnQuery(type: 'tables' | 'views', name: string, config: MssqlConfig): string {
	const schemaName = getSchema(config);
	return `
    SELECT 
        o.id,
        c.name, 
        e.value AS "description",
        ISNULL(TYPE_NAME(c.system_type_id), y.name) AS data_type,
        COLUMNPROPERTY(c.object_id, c.name, 'ordinal') AS position,
        y.is_user_defined,
        y.name AS raw_type,
        convert(nvarchar(4000), OBJECT_DEFINITION(c.default_object_id)) AS column_default,
        convert(varchar(3), CASE c.is_nullable WHEN 1 THEN 'YES' ELSE 'NO' END)	AS is_nullable
      FROM 
        sysobjects o
     INNER JOIN sys.${type} t
        ON t.object_id = o.id 
     INNER JOIN sys.columns c
        ON c.object_id = o.id
      LEFT jOIN sys.extended_properties e
        ON e.major_id = o.id 
           AND e.name = 'MS_Description' 
           AND e.minor_id = c.column_id
      LEFT JOIN sys.types y
        ON c.user_type_id = y.user_type_id
     WHERE 
        t.schema_id = schema_id('${schemaName}')
     AND t.name = '${name}'
    `;
}

async function getColumns(config: MssqlConfig, tableName: string): Promise<MssqlColumn[]> {
	let query = getColumnQuery('tables', tableName, config);
	if (config.includeViews) {
		query += `
          UNION
          ${getColumnQuery('views', tableName, config)}
        `;
	}
	query += `ORDER BY position`;
	const { recordset } = await mssql.query(query);
	debug(`retrieved column information for ${tableName}`);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return recordset.map((row: any) => ({
		name: row.name,
		description: row.description,
		dataType: row.data_type,
		rawType: row.raw_type,
		isUserDefined: row.is_user_defined,
		isNullable: row.is_nullable === 'YES',
		defaultValue: row.column_default,
		// no array types in mssql
		isArray: false,
	}));
}

function getTableQuery(type: 'tables' | 'views', config: MssqlConfig): string {
	const schemaName = getSchema(config);
	let query = `
    SELECT 
        o.id,
        o.name, 
        CASE o.type
		  WHEN 'U' THEN 'BASE TABLE'
		  WHEN 'V' THEN 'VIEW'
        END AS table_type,
        e.value AS "description" 
      FROM 
        sysobjects o
     INNER JOIN sys.${type} t
        ON t.object_id = o.id 
      LEFT jOIN sys.extended_properties e
        ON e.major_id = o.id 
       AND e.name = 'MS_Description' 
       AND e.minor_id = 0 
     WHERE 
        t.schema_id = schema_id('${schemaName}')
    `;
	if (config.excludeTables?.length) {
		query += `
        AND t.name NOT IN ('${config.excludeTables.join("','")}')`;
	}
	if (config.tables?.length) {
		query += `
        AND t.name IN ('${config.tables.join("','")}')`;
	}
	return query;
}

async function getTables(_db: Db, config: MssqlConfig): Promise<Table[]> {
	let query = getTableQuery('tables', config);
	let logEntry = '';

	if (config.includeViews) {
		logEntry += ' and views';
		query += `
        UNION
        ${getTableQuery('views', config)}
        `;
	}
	const { recordset } = await mssql.query(query);
	debug(`retrieved information for ${recordset.length} tables${logEntry}`);

	return recordset.map((row) => ({
		tableName: row.name,
		tableType: row.table_type,
		description: row.description,
	}));
}

async function usingDb<R, T extends (db: Db) => Promise<R>>(dbUri: string, fn: T): Promise<R> {
	const pool = await mssql.connect(dbUri);

	const poolDisposer = Bluebird.resolve(pool)
		.tap(async () => {
			debug('connecting to database');
			await pool.connect();
			debug('connected to database');
		})
		.disposer(async (db) => {
			debug('closing database pool');
			await db.close();
		});
	return Bluebird.using(poolDisposer, fn);
}

export async function getDbSchema(config: MssqlConfig): Promise<MysqlSchemaInfo> {
	debug('fetching database schema from', config.dbUri);
	return usingDb(config.dbUri ?? '', async (db): Promise<MysqlSchemaInfo> => {
		const [tables] = await Promise.all([getTables(db, config)]);
		const tablesWithColumns = await Bluebird.map(tables, async (table) => {
			const columns = await getColumns(config, table.tableName);
			return {
				...table,
				columns,
			};
		});
		return {
			tables: tablesWithColumns,
		};
	});
}
