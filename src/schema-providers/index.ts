import debug from '../debug';
import { SchemaProvider } from '../schema-provider';

import { DatabaseType } from './database-types';

export function getSchemaProvider(dbType: DatabaseType): SchemaProvider {
	try {
		// eslint-disable-next-line
		const provider = require(`./${dbType}`).default as SchemaProvider;
		debug(`required schema provider: ${dbType}`, provider);
		return provider;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(`Unable to load schema provider '${dbType}': ${e}`);
		throw e;
	}
}
