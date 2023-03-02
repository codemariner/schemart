/* eslint-disable no-eval */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-console */
import Path from 'path';

import ts from 'typescript';

import { generate } from '../../src';

describe('generate postgres', () => {
	let schema: string;

	beforeAll(async () => {
		schema = await generate({
			configFile: Path.join(__dirname, 'schemart.yaml'),
			dbUri: 'postgres://postgres:postgres@localhost:5432/schemart',
			dryRun: true,
		});
	});

	it('should generate the correct schema runtypes', () => {
		const result = ts.transpile(schema);
		const output = eval(result);

		expect(output.GenderEnum).toBeTruthy();
		expect(output.Users).toBeTruthy();
		expect(output.BlogPosts).toBeTruthy();
	});
});
