import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';
import { Boolean, Optional, Record, Static, String } from 'runtypes';

import { Config } from './config';
import debug from './debug';
import { schemaProviders } from './schema-providers';
import { generate as generateRuntypes } from './type-generators/runtypes';

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
			'database connection string not specified. Please provide `dbUri` in the configuration or as a command options.'
		);
	}
	const uncheckedConfig = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		...(rawConfig as any),
		dbUri,
	};
	debug('read config', uncheckedConfig);
	const { databaseType } = Config.check(uncheckedConfig);

	const schemaProvider = schemaProviders[databaseType];
	if (!schemaProvider) {
		throw new Error(
			`Database type ${databaseType} from uri ${dbUri} is not supported. Please choose one of ${Object.keys(
				schemaProviders
			).join(',')}`
		);
	}
	debug('using schema provider for', databaseType);

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

	const file = path.join(path.dirname(configFile), config.outfile);
	debug('writing schema def to file', file);
	await fs.promises.writeFile(file, result, 'utf-8');
}

