import url from 'url';

import Bluebird from 'bluebird';
import mysql, { PoolConnection } from 'mysql2/promise';

import baseDebug from '../../debug';
import { Enum, Table } from '../../schema-info';

import { MysqlColumn, MysqlConfig, MysqlSchemaInfo } from './types';

type Db = PoolConnection & {
	dbName: string;
};

const ENUM_VALUE_REGEX = /'([^']*)'/g;

const debug = baseDebug.extend('schema-providers/postrgres');

async function getColumns(db: Db, _config: MysqlConfig, tableName: string): Promise<MysqlColumn[]> {
	const [rows] = await db.query(
		`
        SELECT 
            column_name as 'column_name',
            data_type as 'data_type',
            is_nullable as 'is_nullable',
            column_default as 'column_default',
            column_comment as 'column_comment',
            extra
        FROM information_schema.columns
       WHERE table_name = ?
         AND table_schema  = ?
         AND data_type != 'enum'
       ORDER BY ORDINAL_POSITION`,
		[tableName, db.dbName]
	);

	return (rows as mysql.RowDataPacket[]).map((row: any) => ({
		name: row.column_name,
		dataType: row.data_type,
		rawType: row.data_type,
		isNullable: row.is_nullable === 'YES',
		defaultValue: row.column_default,
		description: row.column_comment,
		isArray: row.data_type === 'ARRAY',
	}));
}

async function getEnums(db: Db, config: MysqlConfig): Promise<Enum[]> {
	let subquery = '';
	let args: string[] = [db.dbName];

	if (config.enums?.length) {
		subquery += 'AND column_name IN (?)';
		args = args.concat(config.enums);
	}
	const [rows] = await db.query(
		`
        SELECT 
            column_name as 'column_name',
            column_type as 'column_type',
            data_type as 'data_type',
            is_nullable as 'is_nullable',
            column_default as 'column_default',
            column_comment as 'column_comment',
            extra
        FROM information_schema.columns
       WHERE table_schema  = ?
         AND data_type IN ('enum', 'set')
         ${subquery}
       ORDER BY ORDINAL_POSITION`,
		args
	);

	const enums = (rows as mysql.RowDataPacket[]).map((row: any) => {
		const values = (row.column_type as string)
			.match(ENUM_VALUE_REGEX)
			?.map((value) => value.replace(/'/g, ''));
		return {
			name: row.column_name,
            description: row.column_comment,
			values: values ?? [],
		};
	});
	return enums;
}

async function getTables(db: Db, config: MysqlConfig): Promise<Table[]> {
	const schemaName = db.dbName;
	const tableTypes = ['BASE TABLE'];
	if (config.includeViews) {
		tableTypes.push('VIEW');
	}
	const args = [schemaName, tableTypes];

	let query = `
        SELECT table_name as 'table_name',
               table_type as 'table_type',
               table_comment as 'description'
          FROM information_schema.tables
         WHERE table_schema = ?
           AND table_type in (?)`;

	if (config.excludeTables?.length) {
		query += `
           AND table_name NOT IN (?)`;
		args.push(config.excludeTables);
	}
	if (config.tables?.length) {
		query += `
           AND table_name IN (?)`;
		args.push(config.tables);
	}
	const [rows] = await db.query(query, args);

	return (rows as mysql.RowDataPacket[]).map((row: any) => ({
		tableName: row.table_name,
		tableType: row.table_type,
        description: row.description
	}));
}

async function usingDb<R, T extends (db: Db) => Promise<R>>(dbUri: string, fn: T): Promise<R> {
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
