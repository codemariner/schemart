import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

import { Config } from './config';
import { schemaProviders } from './schema-providers';
import { mapToRuntype } from './schema-providers/postgres/runtypes';
import { generate as generateRuntypes } from './type-generators/runtypes';

export async function generate(configPath: string, databaseUri?: string): Promise<void> {
	const contents = (await fs.promises.readFile(configPath)).toString('utf-8');
	const rawConfig = yaml.load(contents);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const dbUri = databaseUri ?? (rawConfig as any).dbUri;
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
	const { databaseType } = Config.check(uncheckedConfig);

	const schemaProvider = schemaProviders[databaseType];
	if (!schemaProvider) {
		throw new Error(
			`Database type ${databaseType} from uri ${dbUri} is not supported. Please choose one of ${Object.keys(
				schemaProviders
			).join(',')}`
		);
	}

	const config = schemaProvider.configRt.check(uncheckedConfig);
	const schemaInfo = await schemaProvider.getDbSchema(config);

	let result = '// no data';
	if (config.runtimeType === 'runtypes') {
		// do runtypes generation
		result = generateRuntypes(config, schemaInfo, mapToRuntype);
	}

	fs.promises.writeFile(path.join(__dirname, config.outfile), result);
}
