import Bluebird from 'bluebird';
import { Pool } from 'pg';

import baseDebug from '../../debug';
import { Enum, Index, Table } from '../../schema-info';

import { PostgresColumn, PostgresConfig, PostgresSchemaInfo } from './types';

type Db = Pool;

const debug = baseDebug.extend('schema-providers/postrgres');

function getSchemaName(name?: string): string {
	return name ?? 'public';
}

async function getIndexes(
	db: Db,
	config: PostgresConfig,
	tableName: string
): Promise<Record<string, Index[]>> {
	const result = await db.query(
		`
        SELECT t.relname as table_name,
               i.relname as index_name,
               a.attname as column_name,
               st.schemaname
          FROM pg_class t,
               pg_class i,
               pg_index ix,
               pg_attribute a,
               pg_catalog.pg_statio_all_tables as st
         WHERE t.oid = ix.indrelid
           AND i.oid = ix.indexrelid
           AND a.attrelid = t.oid
           AND a.attnum = ANY(ix.indkey)
           AND t.relkind = 'r'
           AND st.relid = t.oid
           AND st.schemaname = $1
           AND t.relname = $2
        `,
		[getSchemaName(config.schema), tableName]
	);
	return result.rows.reduce((accum, row) => {
		// eslint-disable-next-line no-param-reassign
		(accum[row.column_name] ??= []).push({
			name: row.index_name,
		});
		return accum;
	}, {});
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

	const indexesByColumn = await getIndexes(db, config, tableName);

	return result.rows.map((row) => ({
		name: row.column_name,
		dataType: row.data_type,
		isNullable: row.is_nullable === 'YES',
		udtName: row.udt_name,
		rawType: row.udt_name,
		defaultValue: row.column_default,
		description: row.description,
		isArray: row.data_type === 'ARRAY',
		indexes: indexesByColumn[row.column_name],
	}));
}

async function getEnums(db: Db, config: PostgresConfig): Promise<Enum[]> {
	let subquery = '';
	let args: string[] = [config.schema ?? 'public'];

	if (config.enums?.length) {
		const params = config.enums.map((_, idx) => `$${idx + args.length + 1}`);
		subquery += `AND t.typname IN (${params.join(',')})`;
		args = args.concat(config.enums);
	}

	const result = await db.query(
		`
        SELECT t.typname,
               e.enumlabel,
               pg_catalog.obj_description(t.oid, 'pg_type') AS "description"
          FROM pg_type t
         INNER JOIN pg_enum e
            ON t.oid = e.enumtypid
         INNER JOIN pg_catalog.pg_namespace n
            ON n.oid = t.typnamespace
         WHERE nspname = $1
         ${subquery}
         ORDER BY t.typname, e.enumsortorder`,
		args
	);

	const mapped = result.rows.reduce((accum: { [key: string]: Enum }, row) => {
        // eslint-disable-next-line no-multi-assign, no-param-reassign
        const enumObj:Enum = accum[row.typname] ??= {
            name: row.typname,
            description: row.description,
            values: []
        }
        enumObj.values.push(row.enumlabel)
        return accum;
	}, {});

    return Object.entries(mapped).map(([_key, value]) => value);
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
		const params = config.excludeTables.map((_, idx) => `$${idx + args.length + 1}`);
		query += `
           AND t.table_name NOT IN (${params.join(',')})`;
		args = args.concat(config.excludeTables);
	}
	if (config.tables?.length) {
		const params = config.tables.map((_, idx) => `$${idx + args.length + 1}`);
		query += `
           AND t.table_name IN (${params.join(',')})`;
		args = args.concat(config.tables);
	}
	const result = await db.query(query, args);

	return result.rows.map((row) => ({
		description: row.description,
		tableName: row.table_name,
		tableType: row.table_type,
	}));
}

async function usingDb<R, T extends (db: Db) => Promise<R>>(dbUri: string, fn: T): Promise<R> {
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
