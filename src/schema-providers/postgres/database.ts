import Bluebird from 'bluebird';
import { Pool } from 'pg';

import baseDebug from '../../debug';
import { Enum, Table } from '../../schema-info';

import { PostgresColumn, PostgresConfig, PostgresSchemaInfo } from './types';

type Db = Pool;

const debug = baseDebug.extend('schema-providers/postrgres');

function getSchemaName(name?: string): string {
	return name ?? 'public';
}

async function getColumns(
	db: Db,
	config: PostgresConfig,
	tableName: string
): Promise<PostgresColumn[]> {
	const result = await db.query(
		`
        SELECT c.column_name,
               c.data_type,
               c.is_nullable,
               c.udt_name,
               c.column_default,
               pgd.description
          FROM pg_catalog.pg_statio_all_tables as st
         INNER JOIN pg_catalog.pg_description pgd 
            ON pgd.objoid = st.relid
         RIGHT OUTER JOIN information_schema.columns c
            ON (
                 pgd.objsubid = c.ordinal_position AND
                 c.table_schema = st.schemaname AND
                 c.table_name=st.relname
            )
         WHERE c.table_name = $1
           AND c.table_schema  = $2
         ORDER BY c.dtd_identifier::int;`,
		[tableName, getSchemaName(config.schema)]
	);

	return result.rows.map((row) => ({
		name: row.column_name,
		dataType: row.data_type,
		isNullable: row.is_nullable === 'YES',
		udtName: row.udt_name,
		defaultValue: row.column_default,
		description: row.description,
		isArray: row.data_type === 'ARRAY',
	}));
}

async function getEnums(db: Db, config: PostgresConfig): Promise<Enum[]> {
	const result = await db.query(
		`
        SELECT t.typname,
               e.enumlabel
          FROM pg_type t
         INNER JOIN pg_enum e
            ON t.oid = e.enumtypid
         INNER JOIN pg_catalog.pg_namespace n
            ON n.oid = t.typnamespace
         WHERE nspname = $1
         ORDER BY t.typname, e.enumsortorder`,
		[config.schema ?? 'public']
	);

	const mapped = result.rows.reduce((accum: { [key: string]: string[] }, row) => {
		// eslint-disable-next-line no-param-reassign
		(accum[row.typname] ??= []).push(row.enumlabel);
		return accum;
	}, {});

	return Object.entries(mapped).map(([key, value]) => ({
		name: key,
		values: value,
	}));
}

async function getTables(db: Db, config: PostgresConfig): Promise<Table[]> {
	const schemaName = config.schema ?? 'public';
	const tableTypes = ['BASE TABLE'];
	if (config.includeForeignTables) {
		tableTypes.push('FOREIGN TABLE');
	}
	if (config.includeViews) {
		tableTypes.push('VIEW');
	}
	let args = [schemaName, tableTypes];

	let query = `
        SELECT t.table_name,
               t.table_type,
               pg_catalog.obj_description(pgc.oid, 'pg_class') AS "description"
          FROM information_schema.tables t
         INNER JOIN pg_catalog.pg_class pgc
            ON t.table_name = pgc.relname 
         WHERE t.table_schema = $1
           AND t.table_type = ANY($2)`;

	if (config.excludeTables?.length) {
		// != ANY($3) does not work
		const params = config.excludeTables.map((_, idx) => `$${idx + 3}`);
		query += `
           AND t.table_name NOT IN (${params.join(',')})`;
		args = args.concat(config.excludeTables);
	}
	const result = await db.query(query, args);

	return result.rows.map((row) => ({
		description: row.description,
		tableName: row.table_name,
		tableType: row.table_type,
	}));
}

async function usingDb<T extends (db: Db) => Promise<unknown>>(
	dbUri: string,
	fn: T
): Promise<ReturnType<T>> {
	const pool = new Pool({
		connectionString: dbUri,
		Promise: Bluebird,
	});
	const poolDisposer = Bluebird.resolve(pool)
		.tap(async () => {
			debug('connecting to database');
			const client = await pool.connect();
			debug('connected to database');
			client.release();
		})
		.disposer(async (db) => {
			debug('closing database pool');
			await db.end();
		});
	return Bluebird.using(poolDisposer, fn);
}

export async function getDbSchema(config: PostgresConfig): Promise<PostgresSchemaInfo> {
	debug('fetching database schema from', config.dbUri);
	return usingDb(config.dbUri ?? '', async (db): Promise<PostgresSchemaInfo> => {
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
