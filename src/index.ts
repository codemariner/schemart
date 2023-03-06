import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';
import { Boolean, Optional, Record, Static, String } from 'runtypes';

import { Config } from './config';
import debug from './debug';
import generator from './type-generators';
import { DatabaseTypeNames } from './schema-providers/database-types';
import { getSchemaProvider } from './schema-providers';

export const GenerateOpts = Record({
	configFile: String,
	dbUri: Optional(String),
	dryRun: Optional(Boolean),
});
export type GenerateOpts = Static<typeof GenerateOpts>;
export interface GenerateOptsDryRun extends GenerateOpts {
	dryRun: true;
}

function isDryRun(opts: GenerateOpts): opts is GenerateOptsDryRun {
	return !!opts.dryRun;
}

export async function generate(opts: GenerateOptsDryRun): Promise<string>;
export async function generate(opts: GenerateOpts): Promise<void>;
export async function generate<T extends GenerateOpts>(opts: T): Promise<string | void> {
	const { configFile } = opts;
	const contents = (await fs.promises.readFile(configFile)).toString('utf-8');
	const rawConfig = yaml.load(contents);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const dbUri = opts.dbUri ?? (rawConfig as any).dbUri;
	if (!dbUri) {
		throw new Error(
			'database connection string not specified. Please provide `dbUri` in the configuration or as a command option.'
		);
	}
	const uncheckedConfig = {
		camelCase: true,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		...(rawConfig as any),
		dbUri,
	};
	debug('read config', uncheckedConfig);
	const { databaseType } = Config.check(uncheckedConfig);

	debug('lookup schema provider for', databaseType);
	const schemaProvider = getSchemaProvider(databaseType);
	if (!schemaProvider) {
		throw new Error(
			`Database type ${databaseType} from uri ${dbUri} is not supported. Please choose one of ${DatabaseTypeNames.join(
				','
			)}`
		);
	}

	const config = schemaProvider.configRt.check(uncheckedConfig);
	const schemaInfo = await schemaProvider.getDbSchema(config);

	let result = '// no data';

	result = generator({
		config,
		schemaInfo,
		mapToRuntype: schemaProvider.mapToRuntype,
		getDataType: schemaProvider.getDataType,
	});

	if (isDryRun(opts)) {
		console.log('// dry run mode\n', result);
		if (process.env.NODE_ENV === 'test') {
			// this allows tests to eval the generated code and inspect what's exported
			return `${result}\n module.exports;`;
		}
		return result;
	}
	const file = path.join(path.dirname(configFile), config.outfile);
	await fs.promises.writeFile(file, result, 'utf-8');
	console.log('wrote schema to file', file);
}
