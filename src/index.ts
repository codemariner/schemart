import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';
import { Boolean, Optional, Record, Static, String } from 'runtypes';

import { Config } from './config';
import debug from './debug';
import { generate as generateRuntypes } from './type-generators/runtypes';
import { DatabaseTypeNames } from './schema-providers/database-types';
import { getSchemaProvider } from './schema-providers';

export const GenerateOpts = Record({
	configFile: String,
	dbUri: Optional(String),
	dryRun: Optional(Boolean),
});
export type GenerateOpts = Static<typeof GenerateOpts>;

export async function generate(opts: GenerateOpts): Promise<void> {
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

	debug(schemaProvider);
	const config = schemaProvider.configRt.check(uncheckedConfig);
	const schemaInfo = await schemaProvider.getDbSchema(config);

	let result = '// no data';
	if (config.runtimeType === 'runtypes') {
		// do runtypes generation
		result = generateRuntypes({
			config,
			schemaInfo,
			mapToRuntype: schemaProvider.mapToRuntype,
			getDataType: schemaProvider.getDataType,
		});
	}

	if (!opts.dryRun) {
		const file = path.join(path.dirname(configFile), config.outfile);
		await fs.promises.writeFile(file, result, 'utf-8');
		console.log('wrote schema to file', file);
	} else {
		console.log('// dry run mode\n', result);
	}
}
