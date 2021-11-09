import url from 'url';

import Bluebird from 'bluebird';
import mysql, { PoolConnection } from 'mysql2/promise';

import baseDebug from '../../debug';
import { Enum, Table } from '../../schema-info';

import { MysqlColumn, MysqlConfig, MysqlSchemaInfo } from './types';

type Db = PoolConnection & {
	dbName: string;
};

const debug = baseDebug.extend('schema-providers/postrgres');

async function getColumns(db: Db, _config: MysqlConfig, tableName: string): Promise<MysqlColumn[]> {
	const result = await db.query(
		`
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            column_comment,
            extra
        FROM information_schema.columns
       WHERE table_name = ?
         AND table_schema  = ?
         AND data_type != 'enum'
       ORDER BY ORDINAL_POSITION`,
		[tableName, db.dbName]
	);

	return result[1].map((row: any) => ({
		name: row.column_name,
		dataType: row.data_type,
		isNullable: row.is_nullable === 'YES',
		udtName: row.udt_name,
		defaultValue: row.column_default,
		description: row.description,
		isArray: row.data_type === 'ARRAY',
	}));
}

async function getEnums(db: Db, _config: MysqlConfig): Promise<Enum[]> {
	const [rows] = await db.query(
		`
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            column_comment,
            extra
        FROM information_schema.columns
       WHERE table_schema  = ?
         AND data_type = 'enum'
       ORDER BY ORDINAL_POSITION`,
		[db.dbName]
	);

	// const vals = (rows as mysql.RowDataPacket[]).map((row) => {
	// const values = (row.column_type as string).matchAll(/'(\w*)'/);
	// return {
	// name: row.column_name,
	// values,
	// }
	// })
	const mapped = (rows as mysql.RowDataPacket[]).reduce(
		(accum: { [key: string]: string[] }, row: any) => {
			// eslint-disable-next-line no-param-reassign
			(accum[row.column_name] ??= []).push(row.column_name);
			return accum;
		},
		{}
	);

	return Object.entries(mapped).map(([key, value]) => ({
		name: key,
		values: value,
	}));
}

async function getTables(db: Db, config: MysqlConfig): Promise<Table[]> {
	const schemaName = db.dbName;
	const tableTypes = ['BASE TABLE'];
	if (config.includeViews) {
		tableTypes.push('VIEW');
	}
	const args = [schemaName, tableTypes];

	let query = `
        SELECT table_name,
               table_type
          FROM information_schema.tables
         WHERE table_schema = ?
           AND table_type in (?)`;

	if (config.excludeTables?.length) {
		query += `
           AND table_name NOT IN (?)`;
		args.push(config.excludeTables);
	}
	const [rows] = await db.query(query, args);

	return (rows as mysql.RowDataPacket[]).map((row: any) => ({
		tableName: row.table_name,
		tableType: row.table_type,
	}));
}

async function usingDb<T extends (db: Db) => Promise<unknown>>(
	dbUri: string,
	fn: T
): Promise<ReturnType<T>> {
	const pool = await mysql.createPool({
		uri: dbUri,
	});
	const dbName = url.parse(dbUri).path?.substr(1);
	(pool as any).dbName = dbName;
	const poolDisposer = Bluebird.resolve(pool)
		.tap(async () => {
			debug('connecting to database');
			const client = await pool.getConnection();
			debug('connected to database');
			client.release();
		})
		.disposer(async (db) => {
			debug('closing database pool');
			await db.end();
		});
	return Bluebird.using(poolDisposer, fn);
}

export async function getDbSchema(config: MysqlConfig): Promise<MysqlSchemaInfo> {
	debug('fetching database schema from', config.dbUri);
	return usingDb(config.dbUri ?? '', async (db): Promise<MysqlSchemaInfo> => {
		const [enums, tables] = await Promise.all([getEnums(db, config), getTables(db, config)]);
		const tablesWithColumns = await Bluebird.map(tables, async (table) => {
			const columns = await getColumns(db, config, table.tableName);
			return {
				...table,
				columns,
			};
		});
		return {
			enums,
			tables: tablesWithColumns,
		};
	});
}

getDbSchema({
	databaseType: 'mysql',
	excludeTables: ['schema_migrations'],
	outfile: './schema-foo.ts',
	runtimeType: 'runtypes',
	dbUri: 'mysql://root@localhost:3307/schemart',
});
